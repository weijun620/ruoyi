import request from '@/utils/request'

// 查询报告影像列表
export function listImage(query) {
  return request({
    url: '/plotting/image/list',
    method: 'get',
    params: query
  })
}
// 查询报告影像详细
export function getImage(id) {
  return request({
    url: '/plotting/image/listTwo?reportId='+id,
    method: 'get'
  })
}

// 新增报告影像
export function addImage(data) {
  return request({
    url: '/plotting/image',
    method: 'post',
    data: data
  })
}

// 修改报告影像
export function updateImage(data) {
  return request({
    url: '/plotting/image',
    method: 'put',
    data: data
  })
}

// 删除报告影像
export function delImage(id) {
  return request({
    url: '/plotting/image/' + id,
    method: 'delete'
  })
}

// 导出报告影像
export function exportImage(query) {
  return request({
    url: '/plotting/image/export',
    method: 'get',
    params: query
  })
}