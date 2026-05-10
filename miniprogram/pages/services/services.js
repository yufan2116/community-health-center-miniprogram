Page({
  data: {
    list: [
      {
        key: "vac",
        name: "疫苗接种",
        desc: "国家免疫规划与非免疫规划疫苗接种服务，预约后请携带证件按时到场。",
        tag: "预防接种",
      },
      {
        key: "child",
        name: "儿童保健",
        desc: "0～6岁儿童健康体检、生长发育评估与健康指导。",
        tag: "妇幼保健",
      },
      {
        key: "chronic",
        name: "慢病管理",
        desc: "高血压、2型糖尿病等慢性病随访与用药健康教育。",
        tag: "慢病",
      },
      {
        key: "checkup",
        name: "健康体检",
        desc: "老年人等重点人群健康体检与报告解读（以中心安排为准）。",
        tag: "体检",
      },
      {
        key: "gp",
        name: "全科诊疗",
        desc: "常见病、多发病诊疗与转诊建议，非急诊请错峰就诊。",
        tag: "门诊",
      },
    ],
  },

  goAppointment: function () {
    wx.switchTab({ url: "/pages/appointment/appointment" });
  },
});
