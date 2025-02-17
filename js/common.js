// function csvToArray(csvText, columnCount,groupByField) {
//     // 确保换行符统一为\n
//     csvText = csvText.replace(/\r\n|\r/g, '\n');
    
//     // 分割文本为行
//     let rows = csvText.trim().split('\n');

//     // 第一行作为键名
//     const headers = rows.shift().split(',');

//     let resultArray = [];
//     let currentRow = '';

//     while (rows.length > 0) {
//         currentRow += rows.shift();
//         let cellCount = currentRow.split(',').length - 1 + (currentRow.endsWith('"') ? 1 : 0);
        
//         if (cellCount < columnCount) {
//             // 如果当前单元格数量少于预期的数量，继续添加下一行
//             currentRow += '\n' + (rows[0] || '');
//             // rows[0]?rows.shift():'';
//             //rows.shift();
//             // console.log('当前行：', currentRow);
//             // console.log('当前下一行：', rows[0]);
//         } else {
//             // 当找到一个完整的行时，处理并加入结果数组
//             let cells = parseCells(currentRow);
//             let obj = {};
//             headers.forEach((header, index) => {
//                 obj[header] = cells[index];
//             });
//             resultArray.push(obj);
//             currentRow = ''; // 重置currentRow
//         }
//     }
//     console.log(resultArray);
//     resultArray.forEach(element => {
//         element["你的评论（必填）"] = processText(element["你的评论（必填）"]);
//     });
//     // 根据传入的字段名进行分组
//     let groupedData = groupBy(resultArray, groupByField);

//     // 处理含有换行符和逗号的单元格
//     function parseCells(row) {
//         let cells = [];
//         let lastIndex = 0;
//         let inQuotes = false;

//         for (let i = 0; i <= row.length; i++) {
//             if (row[i] === '"') inQuotes = !inQuotes;
//             if (!inQuotes && row[i] === ',') {
//                 cells.push(row.substring(lastIndex, i).replace(/^"|"$/g, ''));
//                 lastIndex = i + 1;
//             }
//         }
//         return cells;
//     }

//     // 分组函数
    function groupBy(array, key) {
        return array.reduce((result, item) => {
            (result[item[key]] = result[item[key]] || []).push(item);
            return result;
        }, {});
    }
//     //处理重复内容
//     function processText(text) {
//         // 将文本按行分割成数组
//         const lines = text.split('\n');
        
//         // 处理每一行
//         const processedLines = lines.map(line => {
//             // 去除首尾空格
//             const trimmedLine = line;
//             // 如果是空行，跳过（返回空字符串）
//             if (trimmedLine === '') return '';
            
//             // 找到中间位置
//             const middleIndex = Math.floor(trimmedLine.length / 2);
//             // 分割成两段
//             const firstHalf = trimmedLine.substring(0, middleIndex);
//             const secondHalf = trimmedLine.substring(middleIndex);
            
//             // 检查前后两段是否相同
//             if (firstHalf === secondHalf) {
//                 return firstHalf;
//             } else {
//                 return trimmedLine;
//             }
//         }).filter(line => line !== ''); // 过滤掉空行
    
//         // 返回处理后的完整文本
//         return processedLines.join('\n');
//     }
//     return groupedData;
// }

async function getcsv(texturl){
    let end = []
    const response = await fetch(texturl);
        if (!response.ok) {
            throw new Error('Network response was not ok'); 
        }
    const text = await response.text();
    Papa.parse(text, {
        header: true,
        complete: function(results) {
          end = groupBy(results.data,"整合包名称（必填）")
          
        }
      });
      return end;
    // return csvToArray(text,7,"整合包名称（必填）");
}
function getscores(title){
    // data.then(function(data){
        let result = [];
        //console.log(title);
        // csvdata[title]

        if(csvdata[title]==undefined){
            return result;
        }
        for(let i=0;i<csvdata[title].length;i++){
            console.log(title,csvdata[title][i]["你的评分"]);
            if(csvdata[title][i]["你的评分"]!=undefined&&csvdata[title][i]["你的评分"]!="")
                result.push(Number(csvdata[title][i]["你的评分"].trim()));
        }
//        console.log(result);
        return result;
    // });
}
//加入不重复内容
function addUnique(array, element) {
    if (!array.includes(element)) {
      array.push(element);
    }
  }
//
function addplaymeun(array,element){
    for(const key of array){
        if(key.title==element.title){
            return;
        }
    }
    array.push(element);
}
function gettags(title){
    let result = [];
    if(csvdata[title]==undefined){
        return result;
    }
    // maxlen = 0
    for(let i=0;i<csvdata[title].length;i++){
        tags = csvdata[title][i]["整合包元素（必填）"].split(",");
        for(let i=0;i<tags.length;i++){
            tags[i] = tags[i].trim();
            addUnique(result,tags[i]);
        }
        // if(tags.length>maxlen){
        //     maxlen = tags.length;
        //     result = tags;
        // }
    }
    return result;
}
function filterArrayByKeywords(array, ...keywords) {
    return array.filter(item => 
      keywords.every(keyword => item.title.toLowerCase().includes(keyword.toLowerCase()))
    );
  }
function sortArray(array, sortBy) {
    switch (sortBy) {
        case 'initialLetter':
        return [...array].sort((a, b) => a.title.localeCompare(b.title));
        case 'overallRating':
        return [...array].sort((a, b) => b.average_score - a.average_score);
        default:
        return array;
    }
}
function tags_toString(tags){
    let result = "";
    for(let i=0;i<tags.length;i++){
        result += tags[i];
        if(i!=tags.length-1){
            result += ",";
        }
    }
    return result;
}
function maskString(str) {
    // 获取字符串的长度
    const len = str.length;
  
    if (len <= 3) {
      return len === 1 ? '*' : str[0] + '*';
    }
  
    // 否则保留第一个和最后一个字符，中间全部替换为*
    return str[0] + '*'.repeat(len - 2) + str[len - 1];
  }
var csvdata
//等待页面加载完毕
document.addEventListener('DOMContentLoaded', function () {
    data = getcsv("./csv/data.csv");
    data.then(function(data){
        csvdata = data
        console.log(csvdata);
        fetchContent(data);
    });
});
