/**
 * makes sure param a valid boolean
 * @param {boolean} bool 
 * @throws {string} "Must provided input" if bool is falsy
 * @throws {string} "Not Type Boolean" if bool is not a boolean type
 */
export const isValidBool = (bool) => {
    if (bool === null || bool === undefined) throw "Must provided input";
    if (typeof bool !== 'boolean') throw "Not Type Boolean";
}

/**
 * checks to make sure all the values in the string is numbers
 * @param {string} x 
 * @throws {string} "Date invalid format" if any character is not a number
 */
const onlyNums = (x) => {
    for (const num of x) {
        if (isNaN(num) || num < "0" || num > "9") throw "Date invalid format";
    }
};

/**
 * removes the leading zero from a number string
 * @param {string} num 
 * @returns {number} the parsed integer value of the input string
 * @throws {string} "Invalid month or day" if the parsed number is 0
 */
const removeLeadingZero = (num) => {
    num = parseInt(num);
    if (num === 0) throw "Invalid month or day"
    return num;
};

/**
 * checks to make sure the year is a number and not negative 
 * @param {string} year 
 * @returns {number} the parsed integer value of the year
 * @throws {string} "Year Error" if year is not a valid number or is less than or equal to 0
 */
const checkYear = (year) => {
    year = parseInt(year);
    if (isNaN(year) || year <= 0) throw "Year Error";
    return year;
};

/**
 * checks to make sure valid date
 * @param {string} date 
 * @returns {string} the trimmed date string if valid
 * @throws {string} "Must supply birthday" if date is falsy
 * @throws {string} "Date must be a string and not empty" if date is not a string or is empty
 * @throws {string} "Invalid Date Format" if date is not in YYYY-MM-DD format
 * @throws {string} "Date invalid format" if date contains non-numeric characters
 * @throws {string} "Not a valid month" if month is not between 1-12
 * @throws {string} "Not a valid day of the Month" if day is invalid for the given month
 * @throws {string} "Year invalid" if year is in the future
 * @throws {string} "Month invalid" if month is in the future for current year
 * @throws {string} "Day invalid" if day is in the future for current month and year
 */
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

/**
 * Calculates age based on birthday
 * @param {string} birthday - Date string in YYYY-MM-DD format
 * @returns {number} The calculated age
 */
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

