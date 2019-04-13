import logging
import traceback
import threading
import MySQLdb
import redis

from app_config import Config
from lib.lock_utils import FileLock, DBLock

################################
# Create a singleton IDGenerator
################################
class EvolveIdGenerator(object):
    __instance = None

    # Thread safe singleton creation
    _trlock = threading.RLock()

    def __new__(cls, *args, **kwargs):
        if cls.__instance is None:
            with EvolveIdGenerator._trlock:
                if cls.__instance is None:
                    cls.__instance = super(EvolveIdGenerator, cls).__new__(cls, *args, **kwargs)
                    cls.__instance.__initialized = False
        return cls.__instance

    def __init__(self):
        if self.__initialized: return
        self.__initialized = True

        self.redis_key = Config.evolveidgenerator.redis_key
        self.fl = FileLock("/tmp/.idgen.lck")

    ###
    # Generate Case Id with thread lock
    ###
    _idlock = threading.Lock()

    @staticmethod
    def rediscache():
        return redis.StrictRedis(host=Config.redis_cache['host'],
                                 port=Config.redis_cache['port'],
                                 db=Config.redis_cache['db'])

    def generate(self):
        try:
            cache = self.rediscache()
            klen = cache.llen(self.redis_key)
            if klen < Config.evolveidgenerator.trigger_on:
                logging.info("ID current cache size=%d", klen)
                if not EvolveIdGenerator._idlock.acquire(False):
                    logging.info("Another thread running ID generate")
                    return

                try:
                    t = threading.Thread(target=self.populate)
                    t.daemon = False
                    t.start()
                finally:
                    EvolveIdGenerator._idlock.release()

        except Exception, e:
            logging.info("Id generate exception %s", str(e))
            pass

    ###
    # Populate id from db and push to cache single transaction
    ###
    def populate(self):
        ###
        # Lock File
        ###
        if not self.fl.lock(0): return

        iddb = None
        dl = None
        try:
            logging.info("Starting id genenerator")
            iddb = MySQLdb.connect(host=Config.evolveidgenerator.host, db=Config.evolveidgenerator.dbname,
                                   user=Config.evolveidgenerator.user, passwd=Config.evolveidgenerator.password)
            iddb.autocommit(False)

            ###
            # If got dblock then generate
            ###
            dl = DBLock(iddb)
            if not dl.lock(Config.evolveidgenerator.lockname, 0): return

            cache = self.rediscache()

            klen = Config.evolveidgenerator.limit - cache.llen(self.redis_key)
            id_cursor = iddb.cursor()
            id_cursor.callproc('generate_evolveid', (klen,))
            rows = id_cursor.fetchall()
            id_cursor.close()

            # Push entire batch into redis else rollback
            with self.rediscache().pipeline(transaction=True) as pipe:
                    pipe.multi()
                    for row in rows:
                        pipe.lpush(self.redis_key, row[0])
                    pipe.execute()
                    iddb.commit()

            logging.info("ID Generate Complete")

        except Exception, e:
            try:
                if iddb: iddb.rollback()
            except: pass
            logging.error('ID Generate - exc={%s} trc={%s}', str(e), traceback.format_exc())
        finally:
            # Unlock file
            self.fl.unlock()
            # Unlock db
            if dl: dl.unlock(Config.evolveidgenerator.lockname)
            try:
                if iddb: iddb.close()
            except: pass

    def generate_case_id(self):
        try:
            case_id = self.rediscache().lpop(self.redis_key)
        except Exception, e:
            logging.error("Case ID cache fetch exc=%s", str(e))
            case_id = None

        # Populate cache if threshold met
        self.generate()

        return case_id
