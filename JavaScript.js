var calculator = (function () {

  'use strict'
  var keys = [];//the array of keys inputed
  var isAResult = false;//true if a certain input follows a calculation (=)
  var resetDisplay = false; //true if screen just reset with AC
  var display = [];//what is displayed in the lower area of the screen (demo2)
  var nrDecimalPoints = 0;

  function addKey(x) {
    var toStr = x + '';
    var pattern;

    if (keys.length === 0) {
      if (toStr === '.') {
        keys.push(0, '.');
        display.push(0, '.');
        nrDecimalPoints++;
      } else if (toStr.length === 2) {
        keys.push('-');
        display.push('-');
      } else if (toStr.length > 2) {
        keys.push(0);
        display.push(0);
        resetDisplay = true;
      } else {
        keys.push(x);
        display.push(x);
      }
    } else { //one character + input
      var prevStr = keys[keys.length - 1] + '';
      if (resetDisplay) {
        if ((toStr.length === 1) || ((toStr.length === 2) &&
         ((prevStr === 'multiplied') || (prevStr === 'div')))) {
          display = [];
          resetDisplay = false;
        }
      }

      if (toStr.length === 1) {  //when the input is a digit or decimal point
        //if it's a decimal point
        if (x === '.') {
          if (prevStr !== '.' && nrDecimalPoints < 1) {
            if (isAResult) {
              keys = [0, '.'];
              display = [0, '.'];
              isAResult = false;
            } else {
              if (prevStr.length === 1) {
                if (prevStr === '-') {
                  keys.push(0);
                  display.push(0);
                }

                if (!isAResult) {
                  keys.push(x);
                  display.push(x);
                  nrDecimalPoints++;
                } else {
                  keys = [0, '.'];
                  display.push(0, '.');
                  isAResult = false;
                  nrDecimalPoints++;
                }

              } else {
                keys.push(0);
                display.push(0);
                keys.push(x);
                display.push(x);
                nrDecimalPoints++;
              }
            }
          }
        } else {
          if (!isAResult) {
            pattern = /[a-z]-?0$|^0$/;
            if (pattern.test(keys.join(''))) {
              keys[keys.length - 1] = x;
              display[display.length - 1] = x;
            } else {
              keys.push(x);
              display.push(x);
            }
          } else {
            keys = [x];
            display = [x];
            isAResult = false;
          }
        }
      }

      //if the input is an operator
      if (toStr.length > 1) {
        if ((toStr.length === 2) && ((prevStr === 'multiplied') ||
         (prevStr === 'div'))) { //this allows for negative numbers after * or /
          keys.push('-');
          display.push('-');
          nrDecimalPoints = 0;
        } else {
          if (prevStr.length === 1) {
            if (prevStr === '.') {
              keys[keys.length - 1] = x;
              nrDecimalPoints = 0;
            } else if (prevStr === '-') {
              if (keys.length > 2) {
                keys.pop();
              }
            } else {
              keys.push(x);
              nrDecimalPoints = 0;
            }
          } else {
            keys[keys.length - 1] = x;
            nrDecimalPoints = 0;
          }

          resetDisplay = true;
        }

      }
    }

    isAResult = false;
    displayArr();
    if (display.length === 0) {
      document.getElementById('demo2').innerHTML = '0';
    } else {
      document.getElementById('demo2').innerHTML = display.join('');
    }
  }

  //does the calculation
  function getResults() {
    if (keys.length === 1) {
      return keys[0];
    }

    //this trims keys in case it end with an operator, decimal point, minus sign
    var i = keys.length - 1;
    var str;
    while (i > 0) {
      str = keys[i] + '';
      if ((str.length > 1) || (str === '-')) {
        keys.pop();
        i--;
      } else {
        break;
      }
    }

    if (keys[keys.length - 1] === '.') {
      keys.pop();
    }

    var keysJoin = keys.join('');
    var matches = keysJoin.match(/(\-?\d+(\.\d)?\d*)|([a-z]+)/g);
    keys = [];
    var newKeys = [];//identifies series of digits and joins them in numbers
    matches.forEach(function (elem) {
      if (/\d/.test(elem)) {
        newKeys.push(parseFloat(elem));
      } else {
        newKeys.push(elem);
      }

    }
   );

    i = 0;

    //calculates mutliplication and division
    while (i < newKeys.length - 1) {
      if (newKeys[i] === 'multiplied') {
        newKeys[i - 1] *= newKeys[i + 1];
        newKeys.splice(i, 2);
      } else if (newKeys[i] === 'div') {
        if (newKeys[i + 1] === 0) {
          //display "Cannot divide by 0"
          document.getElementById('demo2').innerHTML = 'Cannot divide by 0';
          keys = [];
          display = [];
          return;
        }

        newKeys[i - 1] /= newKeys[i + 1];
        newKeys.splice(i, 2);
      } else {
        i++;
      }
    }

    i = 0;

    //does additions and subtractions
    while (i < newKeys.length - 1) {
      if (newKeys[i] === 'sum') {
        newKeys[i - 1] += newKeys[i + 1];
        newKeys.splice(i, 2);
      } else if (newKeys[i] === 'df') {
        newKeys[i - 1] -= newKeys[i + 1];
        newKeys.splice(i, 2);
      } else {
        i++;
      }
    }

    document.getElementById('demo2').innerHTML = Math.round(newKeys[0] * 100000) / 100000;
    document.getElementById('demo').style.opacity = 0;
    var resultArray = Math.round(newKeys[0] * 100000) / 100000 + '';
    keys = resultArray.split('');
    display = resultArray.split('');
    isAResult = true;
  }

  //displays the operations so far in a cycle in the upper part  of the screen
  function displayArr() {
    var joined = keys.join('');
    joined = joined.replace(/multiplied/g, '&#215;');
    joined = joined.replace(/df/g, '-');
    joined = joined.replace(/sum/g, '+');
    joined = joined.replace(/div/g, '&#247;');
    document.getElementById('demo').innerHTML = joined;
    if (keys.length === 0) {
      document.getElementById('demo').style.opacity = 0;
    } else {
      document.getElementById('demo').style.opacity = 1;
    }
  }

  //deletes the last input
  function clearLast() {
    var len = keys.length;
    var lastKey = keys[len - 1] + '';

    //this condition is necessary to avoid delete result of previous calculations
    //and to avoid cases in which deleting decimal pointsin expressions ending in
    // divided by 0. means that it becomes possible to divide by 0
    if (!isAResult) {
      if (lastKey.length === 1) {
        keys.pop();
        display.pop();
        if (lastKey === '.') {
          nrDecimalPoints = 0;
        }
      } else {
        keys.pop();
        resetDisplay = false;
      }

      if (keys.length > 0) {
        displayArr();
        document.getElementById('demo2').innerHTML = display.join('');
      } else {
        document.getElementById('demo2').innerHTML = '0';
      }

      if (display.length === 0) {
        document.getElementById('demo2').innerHTML = '0';
      }
    }
  }

  //clears the arrays and screen
  function allClear() {
    keys = [];
    display = [];
    document.getElementById('demo').style.opacity = 0;
    document.getElementById('demo').innerHTML = '0';
    document.getElementById('demo2').innerHTML = '0';
    isAResult = false;
    resetDisplay = false;
    nrDecimalPoints = 0;
  }

  return {
    allClear: allClear,
    clearLast: clearLast,
    addKey: addKey,
    getResults: getResults,
  };

})();
