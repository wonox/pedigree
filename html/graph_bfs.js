
// 幅探索を行う console.log(graph.dfs(1)) // 1, 3, 6, 4, 5, 7, 2
// 深さ探索を行う console.log(graph.bfs(1)) // 1, 2, 3, 4, 6, 5, 7

class Graph {
    constructor() {
        this.connectedList = {};
    }
    addVertex(vertex) {
    //    this.connectedList[vertex] = []
    //}
    //      this.connectedList = new Map(); // {}; //[vertex] = [] //
          vertex.forEach(vertex => this.connectedList[vertex] = []);
        }

    addEdge(v1, v2) {
        this.connectedList[v1].push(v2);
        this.connectedList[v2].push(v1);
    }

    removeEdge(vertex1, vertex2) {
        this.connectedList[vertex1] = this.connectedList[vertex1].filter(
            v => v !== vertex2
        );

        this.connectedList[vertex2] = this.connectedList[vertex2].filter(
            v => v !== vertex1
        );
    }

    removeVertex(vertex) {
        while (this.adjacencyList[vertex].length) {
            const adjacentVertex = this.adjacencyList[vertex].pop();
            this.removeEdge(vertex, adjacentVertex);
        }
        delete this.adjacencyList[vertex];
    }

    dfs(start) {
      console.log('this.connectedList', this.connectedList);
      //ノードを格納するスタック
      const stack = [start];
      //訪れた順番を格納
      const result = [];
      //訪れたフラグ
      const visited = {};
      //現在のノード
      let currentVertex;
      //訪問済みフラグを立てる
      visited[start] = true;
      while (stack.length) {
        // stackの最後尾を取得&削除
        currentVertex = stack.pop();
        // resultに現在の頂点を追加
        result.push(currentVertex);
        // 繋がっている頂点を探索して訪問済みにする
        // そして、stackにその頂点を追加
        this.connectedList[currentVertex].forEach(neighbor => {
          if (!visited[neighbor]) {
            visited[neighbor] = true;
            stack.push(neighbor);
          }
        });
      }
      return result;
    }

    bfs(start) {
      // これから探索する予定のものの配列
      const queue = [start];
      // 訪問順番の結果
        const result = [];
      // 探索済みであるか
      const visited = {};
      let currentVertex;
      visited[start] = true;
      while (queue.length) {
        // 先頭から取り出す
        currentVertex = queue.shift();
        // 現在地点を探索済みに
        result.push(currentVertex);
        console.log(currentVertex);
        console.log('this.connectedList[currentVertex]:', this.connectedList[currentVertex]);
        this.connectedList[currentVertex].forEach(neighbor => {
          if (!visited[neighbor]) {
            visited[neighbor] = true;
            queue.push(neighbor);
          }
        });
      }
      return result;
    }
}

