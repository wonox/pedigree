// wikidata APIからJSONを取得
//const getJson = async (url) => {
//  await fetchAsync(url)
// const getJson = async (q_number) => {
  //  await fetchAsync(q_number)
const getJson = async (argument_dict) => {
  await fetchAsync(argument_dict)
    .then(humandataall => {
      
      // class: mermaidを追加する
      const id_mermaid = document.getElementById("mermaid");
      const id_input_Label = document.getElementById("input_label")
      id_mermaid.classList.add("mermaid");
      console.log(humandataall['results']['bindings'].length);
      if (humandataall['results']['bindings'].length == 0) {
        document.getElementById("mermaid").removeAttribute('data-processed');
        id_mermaid.innerHTML = "";
        id_input_Label.innerHTML = "";
        drawError(argument_dict.qnum);
        return;
      }
      let human = {};
      let humanList = [];
      let humanDict = {}
      let edgeList = [];
      let humanLItag = '';
      // jsonからラベルを取り出す
      for (let i = 0; i < humandataall['results']['bindings'].length; i++) {
        if (humandataall['results']['bindings'][i]['human']['value'] == 'http://www.wikidata.org/entity/' + argument_dict.qnum) {
          input_Label = humandataall['results']['bindings'][i]['humanLabel']['value'];
        };
        human = humandataall['results']['bindings'][i]
        // console.log('i %o: ', humandataall['results']['bindings'][i]['human']);
        let humanLabel = human['humanLabel'] ? human['humanLabel']['value'] : '';
        let fatherLabel = human['fatherLabel'] ? human['fatherLabel']['value'] : '';
        let motherLabel = human['motherLabel'] ? human['motherLabel']['value'] : '';
        // {子ども：[父,母]} の連想配列
        humanDict[humanLabel] = [fatherLabel, motherLabel, human['human']['value']]
      }
      // humanLabel:[fatherLabel, motherLabel] の連想配列を展開してedgeListに加える
      let edt = ''
      Object.keys(humanDict).forEach(function (key) {
        edt += key + ":" + humanDict[key] + "<br>";
        humanList.push(key);
        if (humanList.push(humanDict[key][0])) humanList.push(humanDict[key][0]);
        if (humanList.push(humanDict[key][1])) humanList.push(humanDict[key][1]);
        edgeList.push([key, humanDict[key][0]]);
        edgeList.push([key, humanDict[key][1]]);
      });
      const humanList2 = Array.from(new Set(humanList))
      const edgeList3 = edgeList.filter(e => !e.includes(""));
      // グラフへの追加
      const graph = new Graph;
      graph.addVertex(humanList2);
      edgeList3.forEach((e, i) => {
        graph.addEdge(e[0], e[1]);
      });

      // 入力したラベルからの幅優先探索での距離
      // bfs_test = graph.bfs(input_Label);
      if (argument_dict.bfs_or_dfs == 'dfs') {
        bfs_test = graph.dfs(input_Label);
      } else {
        bfs_test = graph.bfs(input_Label);
      }
      // 深さ優先の場合：// bfs_test = graph.dfs(input_Label);
      // 階層でスライス
      bfs_test2 = bfs_test.slice(0, argument_dict.distance);  // distance);
      // スライスしたネットワークから、元の辞書を抽出
      let humanDict2 = {};
      for (key in humanDict) {
        bfs_test2.filter(function (data) {
          if (key == data) {
            humanDict2[key] = humanDict[key];
            console.log('key',key,'humanDict2[key][0]:', humanDict2[key][0]);
            humanLItag += `
            <li> 
            <a href=${humanDict2[key][2]}>${key}</a> =>
            father: ${humanDict2[key][0]}
            mother: ${humanDict2[key][1]}
            </li> `;
          }
        })
      }

      //let edt2 = '';
      let mermaid_text_add = '';
      let spouse_list = [];
      let father_list = [];
      let mother_list = [];
      Object.keys(humanDict2).forEach(function (key) {
        // edt2 += key + ":" + humanDict2[key] + "<br>";
        // mermaidには（）を置換する
        let person = key.replace(/[ \(\)\（\）・＝]/g, '/');
        let father = humanDict2[key][0].replace(/[ \(\)\（\）・＝]/g, '/');
        let mother = humanDict2[key][1].replace(/[ \(\)\（\）・＝]/g, '/');
        // 母がいれば配偶者ノードを作り、母がいなければ父と子を直接結ぶ
        if (mother) {
          let spouse_node = 'spouse' + father + mother + ' --> ' + person + '\n';
          let father_node = father + ' --> ' + 'spouse' + father + mother + '( ):::class1\n';
          let mother_node = mother + ' --> ' + 'spouse' + father + mother + '( ):::class1\n';
          spouse_list.push(spouse_node);
          father_list.push(father_node);
          mother_list.push(mother_node);
          // mermaid_text_add += mother_node;
        } else {
          let father_node = father + ' --> ' + person + '\n';
          father_list.push(father_node);
        }
      }
      );
      // 重複を削除
      const spouse_list2 = Array.from(new Set(spouse_list));
      const father_list2 = Array.from(new Set(father_list));
      const mother_list2 = Array.from(new Set(mother_list));
      spouse_list2.forEach((element) => mermaid_text_add += element);
      father_list2.forEach((element) => mermaid_text_add += element);
      mother_list2.forEach((element) => mermaid_text_add += element);

      // mermaid を描画
      if (mermaid_text_add) {
        drawMermaid(mermaid_text_add);
      };
      // document.getElementById("add_to_me").innerHTML = bfs_test2;
      document.getElementById("add_to_me").innerHTML = humanLItag;
      //document.getElementById("add_to_me").innerHTML = edt2;
      document.getElementById("input_label").innerHTML = input_Label;
    }); return;
};

const graph = new Graph;
// async/awaitを使ったfetchの使い方
// https://query.wikidata.org/sparql?query=SELECT%20DISTINCT%20%20%3Fhuman%20%3Ffather%20%3Fmother%20%3FhumanLabel%20%3FfatherLabel%20%3FmotherLabel%20%3Fsex%0AWHERE%0A%7B%0A%7Bwd%3AQ9862%20wdt%3AP40%2a%20%3Fhuman%20.%0A%20%20%20%20%3Fhuman%20wdt%3AP31%20wd%3AQ5%20.%20%20%20%20%20%20%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP22%20%3Ffather%20.%7D%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP25%20%3Fmother%20.%7D%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP21%20%3Fsex%20.%7D%0A%7D%0AUNION%0A%7B%0Awd%3AQ81731%20wdt%3AP22%2a%20%3Fhuman%20.%0A%20%20%20%20%3Fhuman%20wdt%3AP31%20wd%3AQ5%20.%20%20%20%20%20%20%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP22%20%3Ffather%20.%7D%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP25%20%3Fmother%20.%7D%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP21%20%3Fsex%20.%7D%0A%7D%0AUNION%0A%7B%0Awd%3AQ81731%20wdt%3AP25%2a%20%3Fhuman%20.%0A%20%20%20%20%3Fhuman%20wdt%3AP31%20wd%3AQ5%20.%20%20%20%20%20%20%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP22%20%3Ffather%20.%7D%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP25%20%3Fmother%20.%7D%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP21%20%3Fsex%20.%7D%0A%20%20%7D%0A%0A%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cja%22%20%7D%0A%7D&format=json
async function fetchAsync(argument_dict) {
  // console.log('fetchasyncのq_number:', q_number);
  q_number = argument_dict.qnum;
  const url = 'https://query.wikidata.org/sparql?query=SELECT%20DISTINCT%20%20%3Fhuman%20%3Ffather%20%3Fmother%20%3FhumanLabel%20%3FfatherLabel%20%3FmotherLabel%20%3Fsex%0AWHERE%0A%7B%0A%7Bwd%3A' + q_number + '%20wdt%3AP40%2a%20%3Fhuman%20.%0A%20%20%20%20%3Fhuman%20wdt%3AP31%20wd%3AQ5%20.%20%20%20%20%20%20%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP22%20%3Ffather%20.%7D%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP25%20%3Fmother%20.%7D%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP21%20%3Fsex%20.%7D%0A%7D%0AUNION%0A%7B%0Awd%3A' + q_number + '%20wdt%3AP22%2a%20%3Fhuman%20.%0A%20%20%20%20%3Fhuman%20wdt%3AP31%20wd%3AQ5%20.%20%20%20%20%20%20%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP22%20%3Ffather%20.%7D%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP25%20%3Fmother%20.%7D%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP21%20%3Fsex%20.%7D%0A%7D%0AUNION%0A%7B%0Awd%3A' + q_number + '%20wdt%3AP25%2a%20%3Fhuman%20.%0A%20%20%20%20%3Fhuman%20wdt%3AP31%20wd%3AQ5%20.%20%20%20%20%20%20%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP22%20%3Ffather%20.%7D%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP25%20%3Fmother%20.%7D%0A%20%20%20%20OPTIONAL%7B%3Fhuman%20wdt%3AP21%20%3Fsex%20.%7D%0A%20%20%7D%0A%0A%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2C' + argument_dict.lang + '%22%20%7D%0A%7D&format=json'; //wikidata JSON
  // console.log('url:', url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // OK以外ならばエラーメッセージを投げる
      throw new Error(`response.status = ${response.status}, response.statusText = ${response.statusText}`);
    }
    const jsondata = await response.json();
    return jsondata;
  }
  catch (err) {
    return err;
  }
}

const drawMermaid = (mermaid_text_add) => {
  // mermaidをリロードするため、描画するAttributeを削除してinit
  document.getElementById("mermaid").removeAttribute('data-processed');
  // setTimeout(() => {
  let mermaid_text = `
---
title: family tree
config:
theme: base
themeCSS:
  .node circle {fill: #FAFAFA;}
  .label text {fill: #FAFBF9 !important;} .output {font-size:60px;}
---
graph TD
  classDef class1 fill:#fff,fill-opacity:0
    `.trim();
  mermaid_text += '\n\n';
  mermaid_text += mermaid_text_add;
  console.log(mermaid_text);
  document.querySelector('.mermaid').innerHTML = mermaid_text;
  mermaid.init();// パース開始
  zoomup();
};


const zoomup = () => {
  var svgs = d3.selectAll(".mermaid svg");
  svgs.each(function() {
    var svg = d3.select(this);
    svg.html("<g>" + svg.html() + "</g>");
    var inner = svg.select("g");
    var zoomed = d3.zoom().on("zoom", function(event) {
      inner.attr("transform", event.transform);
    });
    svg.call(d3.zoom()
      .scaleExtent([0.3 , 12])
      .on("zoom", zoomed));
  });
};

const drawError = (error_text) => {
  document.getElementById("add_to_me").innerHTML = error_text + ' is nothing!';
};

