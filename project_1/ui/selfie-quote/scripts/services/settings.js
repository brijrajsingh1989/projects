function getLGAUrl()
{
  //return 'http://127.0.0.1:9000/#!/personal';
  //return 'https://term-qa.lgamerica.com/#!/personal';
  return '/#!/personal';
}

function getSnowFlakeURL()
{
  //return 'https://term-qa.lgamerica.com/selfie-quote/#!/';
  return '/selfie-quote/#!/';
}

function getAge(dateString) {
  var today = new Date();
  dateString = dateString.replace(/-/g,'/');
  dateString = dateString.replace(/ /g,'');
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  return age;
};


function apiTimeoutCounter(){
  return 1000           //Max time limit for system failure
}

function apiAttemptCounter(){
  return 33
}

function check_date(dobInput,ignore){
  if(dobInput == undefined || dobInput== "" || dobInput == null){
  dobInput = "";
  return -1;
}

  dobInput = dobInput.replace(/ /g,'');
  dobInput = dobInput.replace(/\//g,'-');
  if(dobInput.match(/^(0?[1-9]|1[0-2])[-](0?[1-9]|1[0-9]|2[0-9]|3[0-1])[-](19|20)\d{2}$/) == null){
    if(dobInput.match(/^(0?[1-9]|1[0-2])[/](0?[1-9]|1[0-9]|2[0-9]|3[0-1])[/](19|20)\d{2}$/) == null){
    if(ignore !== 1){
      toastr.error('Please Enter Date in proper MM-DD-YYYY format.', 'Attention!')
      }
  }
  return -1;
}
dobInput = dobInput.replace(/\//g,'-')
var day = parseInt(dobInput.split('-')[1]);
var month = parseInt(dobInput.split('-')[0]);
var year = parseInt(dobInput.split('-')[2]);
var day_arr = [0,31,28,31,30,31,30,31,31,30,31,30,31];
if((year %4==0)||((year %100 ==0)&&(year & 400)))
  day_arr[2] = 29;
if(day > day_arr[month]){
  if(ignore !== 1){
  toastr.error('Date is not Proper. Please Re-Enter', 'Attention!')
}
  return -1;
}
  var userAge = getAge(dobInput);
  if(userAge<=-1){
    if(ignore !== 1){
    toastr.error('Entered Date of Birth is in Future. Please Enter Valid Date of Birth', 'Attention!')
  }
    return -1;
  }
};
