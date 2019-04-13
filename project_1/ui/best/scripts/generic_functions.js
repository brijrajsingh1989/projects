// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
function parseUri(str) {
    var o = parseUri.options,
        m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i = 14;
    while (i--) uri[o.key[i]] = m[i] || "";
    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });
    return uri;
};

parseUri.options = {
    strictMode: false,
    key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
    q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};

function merge(target, source) {
    if (typeof target !== 'object') {
        target = {};
    }
    for (let property in source) {
        if (source.hasOwnProperty(property)) {
            let sourceProperty = source[property];
            if (typeof sourceProperty === 'object') {
                target[property] = merge(target[property], sourceProperty);
                continue;
            }
            target[property] = sourceProperty;
        }
    }
    for (let a = 2, l = arguments.length; a < l; a++) {
        merge(target, arguments[a]);
    }
    return target;
};

function dayDiff(date) {
    let x1 = new Date()
    let x2 = new Date(date.replace(/-/g, '/'));
    let x3 = Math.abs(x1.getTime() - x2.getTime());
    return Math.ceil(x3 / (1000 * 3600 * 24));
}

function decimalPlace(data) {
    if (data !== null && data !== undefined) {
        data = data.toString();
        let t = data.split('.');
        if (t[1] !== undefined && t[1] !== null && t[1].length == 1) {
            t[1] = t[1] + '0'
        }
        data = t.join().replace(",", ".");
        return data;
    }
}


function getAge(dateString) {
    let today = new Date();
    dateString = dateString.replace(/-/g, '/');
    dateString = dateString.replace(/ /g, '')
    let birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

function check_date(dobInput, ignore) {
    if (dobInput == undefined || dobInput == "" || dobInput == null) {
        dobInput = "";
        return -1;
    }

    dobInput = dobInput.replace(/ /g, '')
    dobInput = dobInput.replace(/\//g, '-')
    if (dobInput.match(/^(0?[1-9]|1[0-2])[-](0?[1-9]|1[0-9]|2[0-9]|3[0-1])[-](19|20)\d{2}$/) == null) {
        if (dobInput.match(/^(0?[1-9]|1[0-2])[/](0?[1-9]|1[0-9]|2[0-9]|3[0-1])[/](19|20)\d{2}$/) == null) {
            if (ignore !== 1) {
                toastr.error('Please Enter Date in proper MM-DD-YYYY format.', 'Attention!')
            }
        }
        return -1;
    }
    dobInput = dobInput.replace(/\//g, '-')
    let day = parseInt(dobInput.split('-')[1]);
    let month = parseInt(dobInput.split('-')[0]);
    let year = parseInt(dobInput.split('-')[2]);
    let day_arr = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if ((year % 4 == 0) || ((year % 100 == 0) && (year & 400)))
        day_arr[2] = 29;
    if (day > day_arr[month]) {
        if (ignore !== 1) {
            toastr.error('Date is not Proper. Please Re-Enter', 'Attention!')
        }
        return -1;
    }
    let userAge = getAge(dobInput)
    if (userAge <= -1) {
        if (ignore !== 1) {
            toastr.error('Entered Date of Birth is in Future. Please Enter Valid Date of Birth', 'Attention!')
        }
        return -1;
    }
}

function check_expiry_date(dateInput, ignore) {
    //console.log("Check the expiry date................");
    dateInput = dateInput.replace(/ /g, '')
    dateInput = dateInput.replace(/\//g, '-')
    if (dateInput == undefined || dateInput === "" || dateInput === null) {
        //console.log("DATE IS UNDEFINED");
        dateInput = "";
        return -1;
    }
    if (dateInput.match(/^(0?[1-9]|1[0-2])[-](0?[1-9]|1[0-9]|2[0-9]|3[0-1])[-](19|20)\d{2}$/) == null) {
        if (dateInput.match(/^(0?[1-9]|1[0-2])[/](0?[1-9]|1[0-9]|2[0-9]|3[0-1])[/](19|20)\d{2}$/) == null) {
            if (ignore !== 1) {
                toastr.error('Please Enter Date in proper MM-DD-YYYY format.', 'Attention!')
            }
        }
        return -1;
    }
    dateInput = dateInput.replace(/\//g, '-')
    let day = parseInt(dateInput.split('-')[1]);
    let month = parseInt(dateInput.split('-')[0]);
    let year = parseInt(dateInput.split('-')[2]);
    let day_arr = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if ((year % 4 == 0) || ((year % 100 == 0) && (year & 400)))
        day_arr[2] = 29;
    if (day > day_arr[month]) {
        if (ignore !== 1) {
            toastr.error('Date is not Proper. Please Re-Enter', 'Attention!')
        }
        return -1;
    }
    let userAge = getAge(dateInput)
    if (userAge >= 0) {
        if (ignore !== 1) {
            toastr.error('Drivers License has already expired.', 'Attention!')
        }
        return -1;
    }
}

function getSnoflakeRedirectionURL() {
    return "/selfie-quote/#!/";
}
function isValid (data) {
    if (data !== undefined && data !== null && data !== '') {
        return true
    }
    return false
}
