// wikidata APIからJSONを取得
const getJson = async (url) => {
  await fetchAsync(url)
    .then(humandataall => {
      let humanList = [];
      let humanDict = {}
      let edgeList = [];
      let humanLItag = '';
      // jsonからラベルを取り出す
      for (let i = 0; i < humandataall['results']['bindings'].length; i++) {
        let human = humandataall['results']['bindings'][i]
        // console.log('i %o: ', humandataall['results']['bindings'][i]['human']);
        let humanLabel = human['humanLabel'] ? human['humanLabel']['value'] : '';
        let fatherLabel = human['fatherLabel'] ? human['fatherLabel']['value'] : '';
        let motherLabel = human['motherLabel'] ? human['motherLabel']['value'] : '';
        // {子ども：[父,母]} の連想配列
        humanDict[humanLabel] = [fatherLabel, motherLabel]
        // LIタグへの追加と表示
        humanLItag += `
            <li> 
            ${humanLabel}
            ${fatherLabel}
            ${motherLabel} 
            </li> `;
      }
    
      // humanLabel:[fatherLabel, motherLabel] の連想配列を展開してedgeListに加える
      let edt = ''
      Object.keys(humanDict).forEach(function(key) {
        edt +=  key + ":" + humanDict[key] + "<br>" ;
        humanList.push(key);
        if(humanList.push(humanDict[key][0])) humanList.push(humanDict[key][0]);
        if(humanList.push(humanDict[key][1])) humanList.push(humanDict[key][1]);
        edgeList.push([key, humanDict[key][0]]);
        edgeList.push([key, humanDict[key][1]]);
      });
    const humanList2 = Array.from(new Set(humanList))
    const edgeList3 = edgeList.filter(e => !e.includes(""));
    // グラフへの追加
    graph.addVertex(humanList2);
    edgeList3.forEach((e, i) => {
      console.log('edge:', e[0], e[1]);
      graph.addEdge(e[0], e[1]);
    });
    
    bfs_test = graph.bfs('紫式部');
    // 階層でスライス
    bfs_test2 = bfs_test.slice(0, 100);
    console.log('bfs_test2:', bfs_test2);

        
    let humanDict2 = {};
    for(key in humanDict){
        bfs_test2.filter(function(data){
            if(key == data){
                humanDict2[key] = humanDict[key];
            }
        })
    }
    console.log('humanDict2:',humanDict2);

    let edt2 = '';
    let mermaid_text_add = '';
    let spouse_list = [];
    let father_list = [];
    let mother_list = [];
    Object.keys(humanDict2).forEach(function(key) {
      edt2 +=  key + ":" + humanDict2[key] + "<br>" ;
      // mermaidには（）を置換する
      let person = key.replace(/[ \(\)\（\）]/g, '/');
      let father = humanDict2[key][0].replace(/[ \(\)\（\）]/g, '/');
      // console.log('haha:',humanDict2[key][1]);
      let mother = humanDict2[key][1].replace(/[ \(\)\（\）]/g, '/');
      // console.log('haha:', mother);
      // if (humanDict2[key].length = 2) {
      if (mother) {
        let spouse_node = 'spouse' + father + mother + ' --> ' + person + '\n';
        let father_node = father +  ' --> ' + 'spouse' + father + mother + '( ):::class1\n';
        let mother_node = mother +  ' --> ' + 'spouse' + father + mother + '( ):::class1\n';
        // mermaid_text_add += spouse_node;
        // mermaid_text_add += father_node;
        spouse_list.push(spouse_node);
        father_list.push(father_node);
        mother_list.push(mother_node);
        // mermaid_text_add += mother_node;
      } else {
        let father_node = father +  ' --> ' + person + '\n';
        // mermaid_text_add += father_node;
        father_list.push(father_node);
      }
    }
    );
    const spouse_list2 = Array.from(new Set(spouse_list));
    const father_list2 = Array.from(new Set(father_list));
    const mother_list2 = Array.from(new Set(mother_list));
    console.log('spouse_list2:',spouse_list2);
    console.log('father_list2:',father_list2);
    console.log('mother_list2:',mother_list2);
    // mermaid_text_add += [...spouse_list2];
    spouse_list2.forEach((element) =>  mermaid_text_add += element );
    father_list2.forEach((element) =>  mermaid_text_add += element );
    mother_list2.forEach((element) =>  mermaid_text_add += element );

        console.log('edt2:', edt2);
      console.log('mermaid_text_add: ',mermaid_text_add);
    if (mermaid_text_add) {
      drawMermaid(mermaid_text_add);
    };
    // document.getElementById("add_to_me").innerHTML += bfs_test2;
    // document.getElementById("add_to_me").innerHTML += edt2;
    // document.querySelector('.mermaid').innerHTML = mermaid_text;
    }); return;

}

// async/awaitを使ったfetchの使い方
async function fetchAsync(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // OK以外ならばエラーメッセージを投げる
      throw new Error(`response.status = ${response.status}, response.statusText = ${response.statusText}`);
    }
    const jsondata = await response.json();
    //console.log(JSON.stringify(jsondata))
    return jsondata;
  }
  catch (err) {
    return err;
  }
}

const drawMermaid = (mermaid_text_add) => {
  // setTimeout(() => {
    let mermaid_text = `
---
title: familly tree
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
    alert(mermaid_text);
    document.querySelector('.mermaid').innerHTML = mermaid_text;
    mermaid.init();// パース開始
  //}, 3000);// 0.03秒待つ

};

const sample_text2 =`
spouse藤原為時藤原為信の娘//藤原為時の妻/ --> 紫式部
spouse藤原為時藤原為信の娘//藤原為時の妻/ --> 紫式部
spouse藤原宣孝紫式部 --> 大弐三位
spouse藤原為時藤原為信の娘//藤原為時の妻/ --> 紫式部
spouse藤原宣孝紫式部 --> 大弐三位
spouse藤原為信//藤原文範の子/ --> 藤原為
spouse藤原為時藤原為信の娘  --> 藤原為時
spouse藤原為時藤原為信の娘  --> 藤原為時//あ
spouse藤原宣孝紫式部 --> 藤原宣孝
`

const sample_text = `
Q759338-Q106410752 --> 紫式部
藤原兼隆 --> Q11623084-Q3012130( ):::class1
紫式部 --> Q11623184-Q81731( ):::class1
藤原雅正 --> Q3090632-Q106255407( ):::class1
藤原為信の娘////藤原為時の妻// --> Q759338-Q106410752( ):::class1
Q1473290-Q3090632_mother --> 藤原雅正
藤原為時 --> Q759338-Q106410752( ):::class1
Q18233501-Q3012130 --> 高階成章の娘////藤原通宗の妻//
藤原定方の娘////藤原雅正正室// --> Q3090632-Q106255407( ):::class1
藤原兼輔 --> Q1473290-Q3090632_mother( ):::class1
Q11623184-Q81731 --> 大弐三位
高階成章 --> Q18233501-Q3012130( ):::class1
Q3090632-Q106255407 --> 藤原為時
Q18233501-Q3012130 --> 高階為家
Q11623084-Q3012130 --> 源良宗の妻
大弐三位 --> Q11623084-Q3012130( ):::class1
大弐三位 --> Q18233501-Q3012130( ):::class1
藤原為信////藤原文範の子// --> Q106410582-Q106410752_mother( ):::class1
藤原宣孝 --> Q11623184-Q81731( ):::class1
Q106410582-Q106410752_mother --> 藤原為信の娘////藤原為時の妻//
藤原為信の娘////藤原為時の妻//の母 --> Q106410582-Q106410752_mother( ):::class1
藤原雅正の母 --> Q1473290-Q3090632_mother( ):::class1
`



