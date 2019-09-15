function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getPhone(rest) {
  var nums = {"金翠": "電話：2760 1991\t2762 1870\nWhatsApp:6195 3222\t6311 3287",
              "華富": "電話：3689 4753\t3689 4763\nWhatsApp:9388 6637",
              "雲貴川": "電話：2388 8285\nWhatsApp:5578 4146",
              "為食街": "電話：\nWhatsApp:5548 0830",
              "賢友": "電話：2328 3802\t3486 8289\t5113 6587\t6893 5821\nWhatsApp:",
              "御壽司": "電話：2633 4429\nWhatsApp:5222 1522\t5499 1006",
              "家家好": "電話：2511 1003\nWhatsApp:5118 4369",
              "其他": "電話：\nWhatsApp:"
             };
  var phoneNum = nums[rest];
  return phoneNum;
}

function init(ss) {
  var outputSheet = ss.getSheetByName("工作表1");
  outputSheet.getRange("A1:C9").merge().setVerticalAlignment("middle");;
  outputSheet.getRange("A11:C19").merge().setVerticalAlignment("middle");;
  outputSheet.getRange("A10").setValue("餐廳");
  outputSheet.getRange("H1").setValue("preResetTime:");
  outputSheet.getRange("H2").setValue("resetTime:");
  outputSheet.getRange("H3").setValue("lastIndex:");
  outputSheet.getRange("H4").setValue("initialized");
  outputSheet.getRange("I4").setValue(1);
  outputSheet.setColumnWidth(9, 185);
  outputSheet.getRange("I1:I2").setNumberFormat('yyyy"年"mm"月"dd"日" A/P"午"hh:mm:ss');
}
