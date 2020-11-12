import request from '@/utils/request'

// 查询报告标绘元素列表
export function listElements(query) {
  return request({
    url: '/plotting/elements/list',
    method: 'get',
    params: query
  })
}

// 查询报告标绘元素
export function getElements(id) {
  return request({
    url: '/plotting/elements/' + id,
    method: 'get'
  })
}

// 新增报告标绘元素

export function addElements(data) {
  return request({
    url: '/plotting/elements',
    method: 'post',
    data: data
  })
}

// 修改报告标绘元素

export function updateElements(data) {
  return request({
    url: '/plotting/elements',
    method: 'put',
    data: data
  })
}

// 删除报告标绘元素

export function delElements(id) {
  return request({
    url: '/plotting/elements/' + id,
    method: 'delete'
  })
}

// 导出报告标绘元素

export function exportElements(query) {
  return request({
    url: '/plotting/elements/export',
    method: 'get',
    params: query
  })
}