/*
@说明： 专门针对 confluence table 做的可视化 editor
*/


/*
描述：取出字符串中第一次出现的数字含小数点
参数：
str        - (Str) 待处理字符串
*/
function getNum(str){
	return str ? +str.replace(/^[^\d]*(\d+\.?\d*).*/,"$1") || 0 : 0;
}


function tableEditInit($holder){
	// 以下功能只在 /app/category/list/ 生效，根据id 区分
	$holder.find('.pm-appsortable').sortable();
	$holder.find('.pm-appsortable').disableSelection();


	$holder.find('.pm-sortsub a').click(function (){
		var $t = $(this),
			$pr = $t.closest('.pm-category'),
			$crs = $pr.find('textarea.pm-result-cate'),
			cat = $pr.data('cate'),
			crshd = '| '+cat+' | 图片链接 | 淘宝链接 | blogid | 标题 | 打折价 | 原价 | 售出 |',
			idx = $pr.data('idx') || 0;

		$crs.val(crshd)
		$pr.find('.pm-woo').each(function (i,e){
			var $woo = $(e),
				xh = 100*idx + 1 + i,
				href = $woo.find('.pm-mbpho a').attr('href') || '',
				id = href.indexOf('id=') > -1 ? parseInt(href.split('id=')[1]) : 0,
				title = $.trim($woo.find('.pm-g').text()).replace(/^([\d\.]+%\s?)+/ig,''),
				picUrl = $.trim($woo.find('.pm-mbpho img').attr('src')).replace(/^(.*)http:\/\//ig,'http://').replace(/^(.*)https:\/\//ig,'https://'),
				price = getNum($woo.find('.pm-item-detail i').text().replace(/^([\d\.]+%\s?)+/ig,'')) || 0,
				discountPrice = getNum($woo.find('.pm-item-detail .pm-price').text().replace(/^([\d\.]+%\s?)+/ig,'')) || 0,
				volume = Math.round($woo.find('.pm-sout span').text());


			var txav = $crs.val();
			$crs.val(txav + '\n| '+xh+' | '+picUrl+' | http://item.taobao.com/item.htm?id='+id+' | '+id+' | '+title+' | '+discountPrice+' | '+price+' | '+volume+' |')

		})


//		
//		$('#result-total').val(function (){
//			var $txas = $('textarea.pm-result-cate'),
//				r = ''
//			for( var i=0,l=$txas.length; i<l; i++ ){
//				r += $txas.eq(i).val() + '\n\n'
//			}
//
//			return r;
//		})
	})
}