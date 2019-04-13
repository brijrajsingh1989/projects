import logging
import fcntl, errno, time, os

##
# Utilty class to lock db using named lock
##

class FileLock:
    def __init__(self, lockfile):
        self._fd = None
        self._path = lockfile

    def lock(self, timeout=1):
        self._fd = os.open(self._path, os.O_CREAT)
        start_lock_search = time.time()

        while True:
            try:
                fcntl.flock(self._fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                # Lock acquired!
                logging.debug("The lock '%s' was obtained successfully.", self._path)
                return True
            except (OSError, IOError) as ex:
                if ex.errno != errno.EAGAIN:
                    # Resource temporarily unavailable
                    logging.debug("Another client has previously locked '%s'.", self._path)
                    return False
                elif timeout is not None and time.time() > (start_lock_search + timeout):
                    # Exceeded the user-specified timeout.
                    logging.debug("Timeout (%d) secs, to get lock '%s'.", timeout, self._path)
                    return False

            time.sleep(0.1)

    def unlock(self):
        fcntl.flock(self._fd, fcntl.LOCK_UN)
        os.close(self._fd)
        self._fd = None

        try:
            os.unlink(self._path)
        except:
            pass


class DBLock:
    def __init__(self, db):
        self.db = db

    def _execute(self, sql):
        cursor = self.db.cursor()
        ret = None
        try:
            cursor.execute(sql)
            if cursor.rowcount != 1:
                logging.error("Multiple rows returned in mysql lock function.")
            else:
                ret = cursor.fetchone()
        except Exception, ex:
            logging.error("Execute sql \"%s\" failed! Exception: %s", sql, str(ex))
        finally:
            cursor.close()

        return ret

    def lock(self, lockstr, timeout):
        sql = "SELECT GET_LOCK('{}', {})".format(lockstr, timeout)
        ret = self._execute(sql)

        if ret is not None and ret[0] == 0:
            logging.debug("Another client has previously locked '%s'.", lockstr)
            return False
        elif ret is not None and ret[0] == 1:
            logging.debug("The lock '%s' was obtained successfully.", lockstr)
            return True
        else:
            logging.error("Error occurred!")
            return None

    def unlock(self, lockstr):
        sql = "SELECT RELEASE_LOCK('{}')".format(lockstr)
        ret = self._execute(sql)
        if ret is not None and ret[0] == 0:
            logging.debug("The lock '%s' the lock is not released(the lock was not established by this thread).",
                          lockstr)
            return False
        elif ret is not None and ret[0] == 1:
            logging.debug("The lock '%s' the lock was released.", lockstr)
            return True
        else:
            logging.error("The lock '%s' did not exist.", lockstr)
            return None
