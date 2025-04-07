// Helper functions
const onlyNums = (x) => {
    for (const num of x) {
        if (isNaN(num) || num < "0" || num > "9") throw "Date invalid format";
    }
};

const removeLeadingZero = (num) => {
    num = parseInt(num);
    if (num === 0) throw "Invalid month or day"
    return num;
};

const checkYear = (year) => {
    year = parseInt(year);
    if (isNaN(year) || year <= 0) throw "Year Error";
    return year;
};

// Age functions
// checks to make sure valid data
export const isValidDate = (date) => {
    if (!date) throw "Must supply birthday";
    if (typeof date !== 'string' || date.trim().length === 0) throw "Date must be a string and not empty";

    const splitDate = date.trim().split('-');
    
    if (splitDate.length !== 3) throw "Invalid Date Format";
    
    onlyNums(splitDate);

    const currDate = new Date();
    const [currMonth, currDay, currYear] = [currDate.getMonth() + 1, currDate.getDate(), currDate.getFullYear()];
    const [userMonth, userDay, userYear] = [removeLeadingZero(splitDate[1]), removeLeadingZero(splitDate[2]), checkYear(splitDate[0])];

    // checks to make sure valid day in the month and month 1-12
    const daysInMonth = ((userYear % 4 === 0 && userYear % 100 !== 0) || (userYear % 400 === 0))
        ? { 1 : 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 }
        : { 1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 };

    if (!(userMonth in daysInMonth)) throw "Not a valid month";
    if (daysInMonth[userMonth] < userDay) throw "Not a valid day of the Month";

    // checks to make sure future years are invalid
    if (userYear > currYear) throw "Year invalid";
    if (userYear === currYear) {
        if (userMonth > currMonth) throw "Month invalid";
        if (userMonth === currMonth && userDay > currDay) throw "Day invalid";
    }

    return date.trim();
};

// gets the user age
export const getAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    
    // Get current date components
    const currMonth = today.getMonth() + 1;  // getMonth() returns 0-11, so add 1
    const currDay = today.getDate();
    const currYear = today.getFullYear();
    
    // Get birth date components
    const userMonth = birthDate.getMonth() + 1;  // getMonth() returns 0-11, so add 1
    const userDay = birthDate.getDate() + 1;
    const userYear = birthDate.getFullYear();

    // If birthday hasn't occurred this year yet need to calculate
    if (userMonth < currMonth) {
        age--;
    } else if (userMonth === currMonth) {
        // need to cal day
        if (userDay < currDay) {
            age--;
        } 
    }

    return age;
};

// checks if user under 13 if so throw error
export const isUnder13 = (date) => {
    const age = getAge(date);
    console.log(age);
    if (age < 13) throw "Not a valid birthday";
}

// checks if user is under 18 if so return true, else return false
export const isUnder18 = (date) => {
    const age = getAge(date);
    if (age < 18) return true;
    return false
}

