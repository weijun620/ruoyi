import request from '@/utils/request'
export function mineReport(data) {
	let url='/report/editor/list?';
	Object.keys(data).forEach(item=>{
		url+="&"+item+'='+data[item]
	})
	return request({
	  url: url,
	  method: 'get',
	})
}