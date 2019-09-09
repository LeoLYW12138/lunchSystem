function main(selectedRest) {
  var url = "https://docs.google.com/spreadsheets/d/1FGh5c-be08F-fpYhwz4U370Hdq7sRa1sn6LRBFNpoME/edit#gid=1661786259";
  var ss = SpreadsheetApp.openByUrl(url);
  //get the current active sheet
  var activeSheet = ss.getSheetByName("表格回應 1");
  var outputSheet = ss.getSheetByName("工作表1");
  var lastrow = activeSheet.getLastRow();
  var lastcol = activeSheet.getLastColumn();
  var lastIndex = outputSheet.getRange("I3").getValue();
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jan", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var rests = {"golden":"金翠", "wafu":"華富", "wangwai":"雲貴川", "waisikgai":"為食街", "yinyau":"賢友", "yusushi":"御壽司", "others":"其他"};
  selectedRest = rests[selectedRest];

  //get current date
  var d = new Date();
//  var cutOffTime = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 10, 15); //The next day's 10:15
  var preResetTime = outputSheet.getRange("I1").getValue(); //The today's 16:00
  var resetTime = outputSheet.getRange("I2").getValue();

  //reset at 16:00
  if (d > resetTime) {
    preResetTime = resetTime;
    if (d.toLocaleString().slice(0, 12) == resetTime.toLocaleString().slice(0, 12)) {
      resetTime = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 16);
    } else {
      resetTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 16);
    }
    while (activeSheet.getRange(lastIndex + 1, 1).getValue() != "") {
      var dataTime = activeSheet.getRange(lastIndex + 1, 1).getValue();
      if (dataTime > preResetTime) {
        break;
      } else {
        lastIndex++;
      }
    }
    outputSheet.getRange("I1").setValue(preResetTime);
    outputSheet.getRange("I2").setValue(resetTime);
    outputSheet.getRange("I3").setValue(lastIndex);
  }

  //filter out the records in spreadsheet that are written today
  var records = [];
  for (var i = lastIndex + 1; i <= lastrow; i++) {
    var repliedDate = activeSheet.getRange(i, 1).getValue();
    if (repliedDate >= preResetTime && repliedDate <= resetTime) {
      records.push(activeSheet.getRange(i, 2, 1, lastcol).getValues());
    }
  }
  var listForUser = [];
  var listForRest = [];
  var food;
  var drink;
  var subtotal;

  function getItem(item) {
    return item != "";
  }

  function golden(record) {  //2-12 D-N
    record = record[0];
    if (record[1] == selectedRest) {
      subtotal = 30;
      if (record[2] == '') {
        food = record[3].replace(",", "") + "飯";
        var requirement = " " + record[4];
      } else {
        food = record[2];
        var requirement = "";
      }
      var index = record.slice(5, 13).indexOf(record.slice(5, 13).filter(getItem).toString());
      var drinks = ["檸水", "檸茶", "奶茶", "華田", "好立克", "咖啡", "菜蜜", "檸蜜"];
      if (record[index + 5].search("熱") != -1) {
        record[index + 5] = record[index + 5].slice(1).replace(", ", "");
        drink = "熱" + drinks[index] +' '+ record[index + 5].split(", ").toString().replace(/,/g, " ");
      } else if (record[index +5].search("凍") != -1) {
        record[index + 5] = record[index + 5].slice(1).replace(", ", "");
        drink = "凍" + drinks[index] +' '+ record[index + 5].split(", ").toString().replace(/,/g, " ");
      } else {
        drink = drinks[index] +' '+ record[index + 5].split(", ").toString().replace(/,/g, " ");
      }
      food += requirement;

      listForUser.push([record[0], food, drink, subtotal]);
      listForRest.push([food, drink]);
    }
  }

  function wafu(record) {  //13-15 O-Q
    record = record[0];
    if (record[1] == selectedRest) {
      subtotal = 27;
      if (record[14] == '') {
        food = record[13].toString();
      } else {
        food = record[14].toString();
        subtotal += 2;
      }
      subtotal += Number(record[15].substring(1,3)); //add the price of drink to the subtotal
      drink = record[15].slice(3);

      listForUser.push([record[0], food, drink, subtotal]);
      listForRest.push([food, drink]);
    }
  }

  var cucumber = 0;

  function wangwai(record) {  //16-25 R-AA
    record = record[0];
    if (record[1] == selectedRest) {
      subtotal = 0;
      var soupSpec = record.slice(16, 21).filter(getItem).toString();
      var index = record.slice(16, 21).indexOf(soupSpec);

      if (record[21].search("轉薯粉") != -1) {
        record[21] = record[21].replace("轉薯粉", "");
        record[21] = record[21].slice(0, record[21].length - 2);
        var soup = activeSheet.getRange(1, index + 18).getValue().substring(8, 10) + "薯粉" +' '+ soupSpec;
        soup += (record[21] == "") ? "" : ' ' + record[21];
        if (record[20] == "") {
          subtotal += 3;
        }
      } else {
        record[21] = record[21].replace(/, /g, " ");
        var soup = activeSheet.getRange(1, index + 18).getValue().substring(8, 12) +' '+ soupSpec;
        soup += (record[21] == "") ? "" : ' ' + record[21];
      }
      subtotal += Number(activeSheet.getRange(1, index + 18).getValue().substring(5, 7)); //add the price of soup to the subtotal
      var ingred_5 = record[22].replace(/ /g, "").split(",");
      var ingred_6 = record[23].replace(/ /g, "").split(",");
      var ingred_8 = record[24].replace(/ /g, "").split(",");
      function getLength(arr) {
        if (arr[0] == "") {
          return 0;
        } else {
          return arr.length;
        }
      }
      subtotal = subtotal + 5 * getLength(ingred_5) + 6 * getLength(ingred_6) + 8 * getLength(ingred_8);
      food = ingred_5.toString();
      food += (getLength(ingred_5) > 0)? " " + ingred_6.toString() : ingred_6.toString();
      food += (getLength(ingred_6) > 0)? " " + ingred_8.toString() : ingred_8.toString();
      if (record[25] == 1) {
        cucumber += 1;
      }

      listForUser.push([record[0], soup, food, subtotal]);
      listForRest.push([soup, food]);
    }
  }

  function waisikgai(record) {  //26-29  AB-AE
    record = record[0];
    if (record[1] == selectedRest) {
      subtotal = 30;
      if (record[27] == "") {
        food = record[26];
        drink = "";

      } else {
        var spicy = record[27];
        var stick = record[28].split(", ").map(function func(item) {return item.slice(0, 3)});
        var spec = record[29].replace(/, /g, " ");

        food = "涼伴麵" +' '+ spicy +' ';
        food += stick.toString().replace(/,/g, "");
        food += (spec == "")? "" : spec;
        drink = "";
      }
      listForUser.push([record[0], food, subtotal]);
      listForRest.push([food, drink]);
    }
  }

  var yinyauCnt = 0;

  function yinyau(record) {  //30-44 AF-AT
    record = record[0];
    if (record[1] == selectedRest) {
      yinyauCnt += 1;
      subtotal = 28;
      if (record[30] != '') {
        food = record[30] + record[31];
      } else if (record[32] != '') {
        food = record[32];
      } else {
        var index = record.slice(33, 36).indexOf(record.slice(33, 36).filter(getItem).toString());
        var Foods = ["41 炸蝦卷雞翼", "42 炸魚腐叉焼", "43 餐肉腸仔"];
        food = Foods[index] + record[33 + index];
      }
      if (record.slice(36, 45).toString().replace(/,/g, "") == "") {
        drink = "";
      } else if (record[44] == "") {
        var index = record.slice(36, 44).indexOf(record.slice(36, 44).filter(getItem).toString());
        var drinks = ["檸水", "檸茶", "奶茶", "華田", "好立克", "咖啡", "菜蜜"];
        if (record[index + 36].search("熱") != -1) {
          record[index + 36] = record[index + 36].slice(1).replace(", ", "");
          drink = "熱" + drinks[index] +' '+ record[index + 36].split(", ").toString().replace(/,/g, " ");
        } else if (record[index + 36].search("凍") != -1) {
          record[index + 36] = record[index + 36].slice(1).replace(", ", "");
          drink = "凍" + drinks[index] +' '+ record[index + 36].split(", ").toString().replace(/,/g, " ");
        } else {
          drink = drinks[index] +' '+ record[index + 36].split(", ").toString().replace(/,/g, " ");
        }
      } else {
        drink = record[44];
        subtotal += 1;
      }
      listForUser.push([record[0], food, drink, subtotal]);
      listForRest.push([food, drink]);
    }
  }

  function yusushi(record) {  //45-62 AU-BL
    record = record[0];
    if (record[1] == selectedRest) {
      subtotal = 0;
      if (record[45] != '') {
        food = record[45];
        subtotal = (food == "原條浦燒鰻魚飯")? 37 : 30;
      } else if (record.slice(46, 51).filter(getItem) != '') {
        var sauce = record.slice(46, 51).filter(getItem).toString();
        var index = record.slice(46, 51).indexOf(sauce);
        food = activeSheet.getRange(1, index + 49).getValue().substr(9).replace("]", "");
        food = sauce.replace("(黑椒汁)", "") +' '+ "司華力腸" +' '+ food + "飯";
        subtotal = 37;
      } else if (record.slice(51, 58).filter(getItem) != '') {
        var sauce = record.slice(51, 58).filter(getItem).toString();
        var index = record.slice(51, 58).indexOf(sauce);
        food = activeSheet.getRange(1, index + 53).getValue().substr(9).replace("]", "");
        food = sauce.replace("(黑椒汁)", "") +' '+ food + "飯";
        subtotal = 30;
      } else if (record[58] != '') {
        food = "六選一 " + record[58] +' '+ record[60] +' '+ record[61];
        subtotal = 36;
      } else {
        food = "三選一 " + record[59] +' '+ record[60] +' '+ record[61];
        subtotal = 37;
      }
      if (record[62] != '') {
        drink = "轉" + record[62];
        subtotal += 2;
      } else {
        drink = "";
      }
      listForUser.push([record[0], food, drink, subtotal]);
      listForRest.push([food.replace(/六選一 |三選一 /, ""), drink]);
    }
  }

  function others(record) {  //63-65  BM-BO
    record = record[0];
    if (record[1] == selectedRest) {
      subtotal = 0;
      food = record[63];
      drink = record[64];
      subtotal = record[65];
      listForUser.push([record[0], food, drink, subtotal]);
      listForRest.push([food, drink]);
    }
  }

  var boxForRest = outputSheet.getRange("A1");
  var boxForUser = outputSheet.getRange("A11");
  var restName = outputSheet.getRange("B10");

  if (records.length != 0) {
    var restaurant;

    switch(selectedRest) {
        case "金翠": restaurant = golden; break;
        case "華富": restaurant = wafu; break;
        case "雲貴川": restaurant = wangwai; break;
        case "為食街": restaurant = waisikgai; break;
        case "賢友": restaurant = yinyau; break;
        case "御壽司": restaurant = yusushi; break;
      default: restaurant = others;
    }
    records.forEach(restaurant);

    var Uoutput = "";
    var Routput = "";
    var amount = 0;

    restName.setValue(selectedRest);
    listForUser.forEach(function outputUserOrder(order) {
      if (yinyauCnt >= 10) {
        order[3] -= 2; //$2 off for more than 10 lunch
      }
      amount += order[3];
      order[3] = "$" + order[3];
      Uoutput = Uoutput + order.toString().replace(/,/g, " ") + "\n";
    });
    Uoutput = (Uoutput == "")? "無柯打" : Uoutput + "總人數: " + listForUser.length + "   總數: $" + amount;
    boxForUser.setValue(Uoutput);

    if (selectedRest == "雲貴川") {
      listForRest.forEach(function outputRestOrder(order) {
        Routput = Routput + order.toString().replace(/,/g, " ") + "\n";
      });
      if (Routput == "") {
        Routput = "無柯打";
      } else {
      Routput += (cucumber >= 3)? "\n小食: 青瓜, 皮蛋" : "\n小食: 皮蛋";
      }
    } else {
      var Foods = {};
      var Drinks = {};

      listForRest.forEach(function countRestOrder(order) {
        if (order[0] in Foods) {
          Foods[order[0]] += 1;
        } else {
          Foods[order[0]] = 1;
        }
        if (order[1] in Drinks) {
          Drinks[order[1]] += 1;
        } else if (order[1] != ""){
          Drinks[order[1]] = 1;
        }
      });

      var foodOutput = "";
      var drinkOutput = "";

      for (var key in Foods) {
        foodOutput += key;
        foodOutput += (Foods[key] == 1)? "\n" : " x" + Foods[key] + "\n";
      }
      for (var key in Drinks) {
          drinkOutput += key;
          drinkOutput += (Drinks[key] == 1)? "\n" : " x" + Drinks[key] + "\n";
      }

      if (foodOutput == "") {
        Routput = "無柯打";
      } else if (drinkOutput == "") {
        Routput = foodOutput.trim();
      } else {
        Routput = foodOutput.trim() +"\n"+ drinkOutput.trim();
      }

    }
    boxForRest.setValue(Routput);

  } else {
    Routput = "無柯打";
    Uoutput = "無柯打";

    boxForRest.setValue(Routput);
    boxForUser.setValue(Uoutput);
    restName.setValue("");
  }
  Logger.log("\n%s \n%s \n%s", Routput, Uoutput, getPhone(selectedRest));
  return [Routput, Uoutput, selectedRest, getPhone(selectedRest)];
}
