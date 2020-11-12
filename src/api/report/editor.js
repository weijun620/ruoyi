import request from '@/utils/request'

// 查询报告列表
export function listEditor(query) {
  return request({
    url: '/report/editor/listTwo',
    method: 'get',
    params: query
  })
}

// 查询报告详细
export function getEditor(id) {
  return request({
    url: '/report/editor/selectByIdTwo?id=' + id,
    method: 'get'
  })
}

// 新增报告
export function addEditor(data) {
  return request({
    url: '/report/editor',
    method: 'post',
    data: data
  })
}

// 修改报告
export function updateEditor(data) {
  return request({
    url: '/report/editor',
    method: 'put',
    data: data
  })
}

// 删除报告
export function delEditor(id) {
  return request({
    url: '/report/editor/' + id,
    method: 'delete'
  })
}

// 导出报告
export function exportEditor(query) {
  return request({
    url: '/report/editor/export',
    method: 'get',
    params: query
  })
}
export function uploadFile(query) {
  return request({
    url: '/plotting/image/uploadFile',
    method: 'post',
    data: query
  })
}
export function plotting(query) {
  return request({
    url: '/plotting/image',
    method: 'post',
    data: query
  })
}