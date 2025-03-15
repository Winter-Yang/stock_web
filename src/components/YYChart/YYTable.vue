<template>
  <div class="chartcontent">
    <el-table
      :data="tableData"
      style="width: 100%"
      height="100%"
      v-loading="loading"
      :show-header="status"
      class="box-table"
      @cell-click="clickData"
      @sort-change="sortChange"
      :header-cell-style="headerStyle"
      :row-style="rowStyle"
      :cell-style="cellStyle"
    >
      <el-table-column
        v-for="(key, index) in sourceKey"
        :prop="key"
        :key="index"
        :sortable="sortableIF(index)"
        :width="columnWidth(key)"
      >
        <template slot="header">{{ key_names[key]["name"] }}</template>
        <template slot-scope="scope">
          <!-- {{ tableData[scope.$index][key] }} -->
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import json_data from "../Utils/api.js";
let { key_names } = json_data();
export default {
  name: "YYTable",
  props: {
    responseData: {
      type: [Array],
      default: () => [],
    },
    responseKeys: {
      type: [Array],
      default: () => [],
    },
    status: {
      type: [Boolean],
      default: () => true,
    },
  },
  data() {
    return {
      sourceKey: this.responseKeys,
      key_names: key_names,
      tableData: this.responseData,
      loading: true,
      headerStyle: {
        "font-weight": "bold",
        "font-size": "13px",
        height: "50px",
        color: "#333333",
        "background-color": "#373433",
        "text-align": "center",
      },
      rowStyle: {
        "font-weight": "normal",
        "font-size": "12px",
        height: "45px",
        "text-align": "center",
      },
    };
  },
  beforeMount() {
    this.loading = false;
  },
  methods: {
    columnWidth(key) {
      return this.key_names[key]["width"];
    },
    sortableIF(index) {
      if (index >= 5) {
        return "custom";
      }
      return false;
    },
    cellStyle({ rowIndex, column }) {
      //根据测试结果动态调整单元格样式，成功-绿色，失败-红色，不支持-黄色
      let color = "#555555";

      if (rowIndex >= 0) {
        if (column.property == "percent") {
          let percent = this.tableData[rowIndex]["percent"];
          let percent_n = Number(percent.split("%")[0]);
          if (percent_n > 0) {
            color = "red";
          } else {
            color = "green";
          }
        }
        if (column.property == "net_mf_amount") {
          let net_mf_amount = this.tableData[rowIndex]["net_mf_amount"];
          let net_mf_amount_n = Number(net_mf_amount.split("万")[0]);
          if (net_mf_amount_n > 0) {
            color = "red";
          } else {
            color = "green";
          }
        }
      }

      let aa = {
        color: color,
        "font-size": "12px",
        "text-align": "center",
      };
      return aa;
    },
    compareDesc(propertyName, order) {
      return function (object1, object2) {
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        if (propertyName == "net_mf_amount" || propertyName == "buy_elg_amount") {
          value1 = Number(value1.split("万")[0]);
          value2 = Number(value2.split("万")[0]);
        }

        if (propertyName == "circ_mv") {
          value1 = Number(value1.split("亿")[0]);
          value2 = Number(value2.split("亿")[0]);
        }
        if (
          propertyName == "percent" ||
          propertyName == "huanshou" ||
          propertyName == "buy_elg_percent"
        ) {
          value1 = Number(value1.split("%")[0]);
          value2 = Number(value2.split("%")[0]);
        }

        if (order == "descending") {
          if (value2 < value1) {
            return -1;
          } else if (value2 > value1) {
            return 1;
          } else {
            return 0;
          }
        }
        if (order == "ascending") {
          if (value2 < value1) {
            return 1;
          } else if (value2 > value1) {
            return -1;
          } else {
            return 0;
          }
        }
      };
    },
    sortChange(column) {
      this.tableData = this.tableData.sort(this.compareDesc(column.prop, column.order));
    },
    clickData(row, column, cell) {
      let aa = String(cell.innerHTML);

      if (aa.indexOf("SH") > -1 || aa.indexOf("SZ") > -1) {
        let code = row["ts_code"];
        aa = code.split(".");
        let url = "https://xueqiu.com/S/" + aa[1] + aa[0];
        window.open(url);
      }
    },
  },
};
</script>

<style>
.chartcontent {
  /* padding: 5px; */
  width: 100%;
  height: 98%;
  background-color: rgb(209, 189, 230);
}

.el-table__cell {
  padding: 0px !important;
  border-right: 0px !important;
  border-left: 0px !important;
}
.el-table__row > td {
  /* border: none !important; */
  border-right: 0px !important;
  border-left: 0px !important;
}

.el-table--border {
  border-right: 0px !important;
  border-left: 0px !important;
}

.el-table--border {
  border-right: 0px !important;
}
</style>
