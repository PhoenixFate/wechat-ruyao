/**
 * Created by xiabingwu on 2016/11/21.
 */
export default function (canvasConfig, params) {
  var chartColors = {
    zl: 'rgb(255, 99, 132)',
    bp: 'rgb(75, 192, 192)',
    cd: 'rgb(54, 162, 235)'
  };
  
  var chartConfig = {
    type: 'pie',
    data: {
      datasets: [{
        data: [
          params.zl,
          params.bp,
          params.cd,
        ],
        backgroundColor: [
          chartColors.zl,
          chartColors.bp,
          chartColors.cd,
        ]
      }],
      labels: [
        "智力题",
        "奔跑题",
        "穿戴题",
      ]
    },
    options: {
      responsive: true,
      legend: {
        display: false,
        displayFixed: true,
        position: 'bottom',
        fullWidth: true,
        onClick: function (tooltipItem, data) {
          console.log(data.index);
          wx: wx.navigateTo({
            url: '../selectQuestions/selectQuestions?typeIndex=' + data.index,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          });
          return;
        }
      }
    }
  };
  return {
    chartConfig: chartConfig,
    canvasConfig: canvasConfig
  }
}