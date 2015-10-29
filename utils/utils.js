String.prototype.capitalize = function() {
  return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

var lastNameAtStartRegExp = /((?:van |de |^)\w.*?)\W/i;
String.prototype.extractLastNameAtStart = function() {
  var match = lastNameAtStartRegExp.exec(this);
  var name = match ? match[1] : this;
  return name.toLowerCase().capitalize();
};

String.prototype.convertToMonthNumber = function() {
  switch (this.toString()) {
    case 'Jan':
    case 'January':
      return '01';
    case 'Feb':
    case 'February':
      return '02';
    case 'Mar':
    case 'March':
      return '03';
    case 'Apr':
    case 'April':
      return '04';
    case 'May':
      return '05';
    case 'Jun':
    case 'June':
      return '06';
    case 'Jul':
    case 'July':
      return '07';
    case 'Aug':
    case 'August':
      return '08';
    case 'Sep':
    case 'September':
      return '09';
    case 'Oct':
    case 'October':
      return '10';
    case 'Nov':
    case 'November':
      return '11';
    case 'Dec':
    case 'December':
      return '12';
    default:
      return 'invalidmonth_' + this;
  }
}
