/*jshint unused:false */
var NAMESPACE = 'castform::';


var storage = {
  /**
   * Stores a value in local storage.
   *
   * @param {String} formID
   * @param {String} key
   * @param {String} value
   */
  set: function storageSet(formID, key, value) {
    if (localStorage) {
      key = NAMESPACE + formID + '::' + key;
      if (JSON && JSON.stringify) {
        value = JSON.stringify(value);
      }
      console.log('saving value', key, value);
      localStorage.setItem(key, value);
    }
  },


  /**
   * Retrieves a value from local storage.
   *
   * @param {String} formID
   * @param {String} key
   * @param {String} fallback If no value found in local storage, return this.
   * @return {String}
   */
  get: function storageGet(formID, key, fallback) {
    if (localStorage) {
      key = NAMESPACE + formID + '::' + key;
      var storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON && JSON.parse ? JSON.parse(storedValue) : storedValue;
      } else {
        return fallback;
      }
    } else {
      return fallback;
    }
  }
};
