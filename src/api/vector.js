import request from '@/utils/request'
export function getVextorData({
  pageNum,
  pageSize,
  condition
}) {
  return request({
    url: `/gis-plugin/VectorData/queryTableInformation?pageNum=${pageNum}&pageSize=${pageSize}&condition=${condition}`,
    method: "get"
  })
}
export function getTaleInfo({
  pageNum,
  pageSize,
  tableName
}) {
  return request({
    url: `/gis-plugin/VectorData/queryTableList?pageNum=${pageNum}&pageSize=${pageSize}&tableName=${tableName}`,
    method: "get"
  })
}
export function getqueryList() {
  return request({
    url: `/gis-plugin/layerManagement/queryByList`,
    method: "get"
  })
}
export function vector(data) {
  return request({
    url: `/gis-plugin/layerManagement/saveLayerManagement`,
    method: "POST",
    data,
    text: "notrans"
  })
}
export function del(data) {
  return request({
    url: `/gis-plugin/layerManagement/deleteLayer`,
    method: "POST",
    data,
    text: "notrans"
  })
}
export function queryOne(id) {
  return request({
    url: `/gis-plugin/layerManagement/queryOne?layerId=` + id,
    method: "get"
  })
}
