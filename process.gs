 function main(selectedRest) {
  var url = "https://docs.google.com/spreadsheets/d/1FGh5c-be08F-fpYhwz4U370Hdq7sRa1sn6LRBFNpoME/edit#gid=1661786259";
  var ss = SpreadsheetApp.openByUrl(url);
  //get the current active sheet
  var activeSheet = ss.getSheetByName("表格回應 1");
  var outputSheet = ss.getSheetByName("工作表1");
  //insert a new sheet if it does not exist
  if (!outputSheet) {
    ss.insertSheet('工作表1');
    outputSheet = ss.getSheetByName("工作表1");
  }
  if (outputSheet.getRange("I4").isBlank()) {
    init(ss);
  }
  var lastrow = activeSheet.getLastRow();
  var lastcol = activeSheet.getLastColumn();
  var lastIndex = outputSheet.getRange("I3").getValue();
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jan", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
   var rests = {"golden":"金翠", "wafu":"華富", "wangwai":"雲貴川", "waisikgai":"為食街", "yinyau":"賢友", "yusushi":"御壽司", "gagahou":"家家好", "jukgajong":"粥家莊", "others":"其他"};
  selectedRest = rests[selectedRest];

  //get current date
  var d = new Date();
//  var cutOffTime = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 10, 15); //The next day's 10:15
  var preResetTime = outputSheet.getRange("I1").getValue(); //Today's 16:00
  var resetTime = outputSheet.getRange("I2").getValue();

  //reset at 16:00
  if (d > resetTime) {
    preResetTime = resetTime;
    if (d.toLocaleString().slice(0, 12) == resetTime.toLocaleString().slice(0, 12)) {
      resetTime = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 16);
    } else {
      resetTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 16);
    }
    //get the index of last record
    while (activeSheet.getRange(lastIndex + 1, 1).getValue() != "") {
      var dataTime = activeSheet.getRange(lastIndex + 1, 1).getValue();//get the timestamp of that record
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

  function getDrink(start, end, record) {
    var temp;
    var index = record.slice(start, end).indexOf(record.slice(start, end).filter(getItem).toString());
    var drinks = ["檸水", "檸茶", "奶茶", "華田", "好立克", "咖啡", "菜蜜", "檸蜜"];
    if (record[index + start].search("熱") != -1) {
      record[index + start] = record[index + start].slice(1).replace(", ", "");
      temp = "熱" + drinks[index] +' '+ record[index + start].split(", ").toString().replace(/,/g, " ");
    } else if (record[index + start].search("凍") != -1) {
      record[index + start] = record[index + start].slice(1).replace(", ", "");
      temp = "凍" + drinks[index] +' '+ record[index + start].split(", ").toString().replace(/,/g, " ");
    } else {
      temp = drinks[index] +' '+ record[index + start].split(", ").toString().replace(/,/g, " ");
    }
    return temp;
  }

  function golden(record) {  //5-15 G-Q
    record = record[0];
    if (record[1] == selectedRest) {
      subtotal = 30;
      if (record[5] == '') {
        food = record[6].replace(",", "") + "飯";
        var requirement = " " + record[7];
      } else {
        food = record[5];
        var requirement = "";
      }
      food += requirement;
      drink = getDrink(8, 16, record);
      listForUser.push([record[0], food, drink, subtotal]);
      listForRest.push([food, drink]);
    }
  }

  function wafu(record) {  //16-18 R-T
    record = record[0];
    if (record[1] == selectedRest) {
      subtotal = 27;
      if (record[17] == '') {
        food = record[16].toString();
      } else {
        food = record[17].toString();
        subtotal += 2;
      }
      subtotal += Number(record[18].substring(1,3)); //add the price of drink to the subtotal
      drink = record[18].slice(3);

      listForUser.push([record[0], food, drink, subtotal]);
      listForRest.push([food, drink]);
    }
  }

  var cucumber = 0;

  function wangwai(record) {  //19-28 U-AD
    record = record[0];
    if (record[1] == selectedRest) {
      subtotal = 0;
      var soupSpec = record.slice(18, 24).filter(getItem).toString();
      var index = record.slice(19, 24).indexOf(soupSpec);

      if (record[24].search("轉薯粉") != -1) {
        record[24] = record[24].replace("轉薯粉", "");
        record[24] = record[24].slice(0, record[24].length - 2);
        var soup = activeSheet.getRange(1, index + 21).getValue().substring(8, 10) + "薯粉" +' '+ soupSpec;
        soup += (record[24] == "") ? "" : ' ' + record[24];
        if (record[23] == "") {
          subtotal += 3;
        }
      } else {
        record[24] = record[24].replace(/, /g, " ");
        var soup = activeSheet.getRange(1, index + 21).getValue().substring(8, 12) +' '+ soupSpec;
        soup += (record[24] == "") ? "" : ' ' + record[24];
      }
      subtotal += Number(activeSheet.getRange(1, index + 21).getValue().substring(5, 7)); //add the price of soup to the subtotal
//      var ingred_5 = record[25].replace(/ /g, "").split(","); outdated!
      var ingred_6 = record[25].replace(/ /g, "").split(",");
      var ingred_10 = record[27].replace(/ /g, "").split(",");
      function getLength(arr) {
        if (arr[0] == "") {
          return 0;
        } else {
          return arr.length;
        }
      }
      subtotal = subtotal + 6 * getLength(ingred_6) + 10 * getLength(ingred_10);
      food = ingred_6.toString();
      food += (getLength(ingred_6) > 0)? " " + ingred_10.toString() : ingred_10.toString();
      if (record[28] == 1) {
        cucumber += 1;
      }

      listForUser.push([record[0], soup, food, subtotal]);
      listForRest.push([soup, food]);
    }
  }

  function waisikgai(record) {  //29-32  AE-AH
    record = record[0];
    if (record[1] == selectedRest) {
      subtotal = 30;
      if (record[30] == "") {
        food = record[29];
        drink = "";

      } else {
        var spicy = record[30];
        var stick = record[31].split(", ").map(function func(item) {return item.slice(0, 3)});
        var spec = record[32].replace(/, /g, " ");

        food = "涼伴麵" +' '+ spicy +' ';
        food += stick.toString().replace(/,/g, "");
        food += (spec == "")? "" : spec;
        drink = "";
      }
      listForUser.push([record[0], food, drink, subtotal]);
      listForRest.push([food, drink]);
    }
  }

  var yinyauCnt = 0;

  function yinyau(record) {  //33-46 AI-AV
    record = record[0];
    if (record[1] == selectedRest) {
      yinyauCnt += 1;
      subtotal = 28;
      if (record[32] != '') {
        food = record[32] + record[33];
      } else if (record[34] != '') {
        food = record[34];
      } else {
        var index = record.slice(35, 38).indexOf(record.slice(35, 38).filter(getItem).toString());
        var Foods = ["41 炸蝦卷雞翼", "42 炸魚腐叉焼", "43 餐肉腸仔"];
        food = Foods[index] + record[35 + index];
      }
      if (record.slice(38, 47).toString().replace(/,/g, "") == "") {
        drink = "";
      } else if (record[46] == "") {
        drink = getDrink(38, 47, record);
      } else {
        drink = record[46];
        subtotal += 1;
      }
      listForUser.push([record[0], food, drink, subtotal]);
      listForRest.push([food, drink]);
    }
  }

  function yusushi(record) {  //47-64 AW-BN
    record = record[0];
    if (record[1] == selectedRest) {
      subtotal = 0;
      if (record[47] != '') {
        food = record[47];
        subtotal = (food == "原條浦燒鰻魚飯")? 37 : 30;
      } else if (record.slice(48, 53).filter(getItem) != '') { //司華力腸餐
        var sauce = record.slice(48, 53).filter(getItem).toString();
        var index = record.slice(48, 53).indexOf(sauce);
        food = activeSheet.getRange(1, index + 50).getValue().substr(9).replace("]", "");
        food = sauce.replace("(黑椒汁)", "") +' '+ "司華力腸" +' '+ food + "飯";
        subtotal = 37;
      } else if (record.slice(53, 60).filter(getItem) != '') { //大滿足餐
        var sauce = record.slice(53, 60).filter(getItem).toString();
        var index = record.slice(53, 60).indexOf(sauce);
        food = activeSheet.getRange(1, index + 55).getValue().substr(5).replace("]", "");
        food = sauce.replace("(黑椒汁)", "") +' '+ food + "飯";
        subtotal = 30;
      } else if (record[60] != '') {
        food = "六選一 " + record[60] +' '+ record[62] +' '+ record[63];
        subtotal = 36;
      } else {
        food = "三選一 " + record[61] +' '+ record[62] +' '+ record[63];
        subtotal = 37;
      }
      if (record[64] != '') {
        drink = "轉" + record[64];
        subtotal += 2;
      } else {
        drink = "";
      }
      listForUser.push([record[0], food, drink, subtotal]);
      listForRest.push([food.replace(/六選一 |三選一 /, ""), drink]);
    }
  }

  var gagaCnt = 0;
  function gagahou(record) {  //65-66 BO-BP
    record = record[0];
    if (record[1] == selectedRest) {
      gagaCnt += 1;
      subtotal = 27;
      food = record[65];
      if (record[66] != "") {
        drink = record[66];
        subtotal += 3;
      } else {
        drink = "";
      }
      listForUser.push([record[0], food, drink, subtotal]);
      listForRest.push([food, drink]);
    }
  }

   function jukgajong(record) {  //67-75 BQ-BY
     record = record[0];
     if (record[1] == selectedRest) {
       subtotal = 0;
       food = "";
       drink = "";
       for (var i = 67; i < 70; i++) {
         if (record[i] != "") {
           food += "單點" + record[i].toString().substr(4).replace(/,/g, "") + " ";
           subtotal += Number(record[i].substring(1, 3));
         }
       }
       if (record[70] != "") {
         drink = record[70].toString().substr(4).replace(/,/g, "");
         subtotal += Number(record[70].substring(1, 3));
       }
       if (record[71] != "") {
         food += record[71].substr(4) + "+";
         subtotal += Number(record[71].substring(1, 3));
         var ingred = record.slice(72, 76).filter(getItem).toString();
         food += ingred;
         switch (record.slice(72, 76).indexOf(ingred)) {
             case 0: subtotal += 0; break;
             case 1: subtotal += 1; break;
             case 2: subtotal += 6; break;
             case 3: subtotal += 9; break;
           default: break;
         }

       }
       listForUser.push([record[0], food, drink, subtotal]);
       listForRest.push([food, drink]);
     }
   }


  function others(record) {  //2-4  D-F
    record = record[0];
    if (record[1] == selectedRest) {
      subtotal = 0;
      food = record[2];
      drink = record[3];
      subtotal = record[4];
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
        case "家家好": restaurant = gagahou; break;
        case "粥家莊": restaurant = jukgajong; break;
      default: restaurant = others;
    }
    records.forEach(restaurant);

    var Uoutput = "";
    var Routput = "";
    var amount = 0;

    restName.setValue(selectedRest);
    listForUser.forEach(function outputUserOrder(order) {
      if (yinyauCnt >= 10 || gagaCnt >= 10) {
        order[3] -= 2; //$2 off for more than 10 lunch
      }
      amount += order[3];
      order[3] = "$" + order[3];
      Uoutput = Uoutput + order.toString().replace(/,/g, " ") + "\n";
    });
    Uoutput = (Uoutput == "")? "無柯打" : Uoutput.slice(0, -1);
    boxForUser.setValue(Uoutput);

    var i = 0;
    if (selectedRest == "雲貴川") {
      listForRest.forEach(function outputRestOrder(order) {
        i++;
        Routput = Routput + i + ". " + order.toString().replace(/,/g, " ") + "\n";
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
  return [Routput, Uoutput, selectedRest, getPhone(selectedRest), listForUser.length, amount];
}
