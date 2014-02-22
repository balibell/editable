/*
@说明：baidu 统计被植入广告的简单解决方案
*/



// start from here
;(function (window,document){
	// 双十一 特卖会特用功能
	if( window.location.href.indexOf('http://wiki.dev.duitang.com/pages/viewpage.action') > -1 ){
		/*
		@说明： 淘宝图片缩略图
		@参数：
		$tb				- (Obj) 待分析的table 对象
		*/
		function taobaoThumbPic(pic,w,h){
			// 如果不是图片 则返回空
			if( !pic.match(/^http:\/\//) ){
				return ''
			}

			// 如果是淘宝图片，则返回淘宝缩略图
			if( /^http:\/\/[^\/]*(alicdn|taobaocdn|aliimg)\.com/.test(pic) ){
				// http://img01.taobaocdn.com/bao/uploaded/i1/T1vNv0XiVkXXaM05A3_050406.jpg_310x310.jpg
				var pic = pic.replace(/_\.webp$/ig,''),
						w = w || 310,
						h = h || 310;

				pic = pic.replace(/_\d+x[\da-z]{1,10}\.jpg$/ig,'')

				return pic + '_'+w+'x'+h+'.jpg';
			}else{
				return pic
			}
		}

		/*
		@说明： table 对象数据分析，并弹出编辑界面
		@参数：
		$tb				- (Obj) 待分析的table 对象
		*/
		function showEdit($tb){
			var $dtholderwrap = $('#pm-holder-wrap'),
				catenm = $.trim($tb.find('td:first').text()),
				idx = Math.floor(parseInt($tb.find('tr:nth-child(2)').find('td:first').text()) / 100),
				strhtml = transTableTo($tb,true)[0];


			if( !$dtholderwrap.length ){
				$dtholderwrap = $('<div id="pm-holder-wrap"><a id="pm-holder-close" href="javascript:;">关闭</a><div id="pm-holder"></div></div>').appendTo('body')

				$('#pm-holder-close').click(function (e){
					// 顺便关闭 wooedit 弹出层
					$('#pm-wooedit').css('display','none');
					$dtholderwrap.remove();
				})
			}
			$dtholderwrap.css({
				"display" : "block"
			})

			var $dtholder = $('#pm-holder');
			$dtholder.html('<div class="pm-category" data-cate="'+catenm+'" data-idx="'+idx+'"><div class="sstitle pm-wrap">'+catenm+' ================================</div><div class="oh pm-wrap"><div class="pm-appsortable pm-item-list clr">'+strhtml+'</div></div><div class="pm-sortsub clr"><a class="abtn" href="javascript:;"><u>↑生成新代码</u></a><textarea class="pm-result-cate" ></textarea></div></div>')

			// tableedit 初始化
			tableEditInit($dtholderwrap);

			window.scrollTo(0,0);
		}






		// 转换 confluence table to html 字符串和 json 字符串
		function transTableTo($table,nodatasrc,howm){
			var $trs = $table.find('tr'),
				howm = parseInt(howm) || 9999,
				idx = Math.floor(parseInt($table.find('tr:nth-child(2)').find('td:first').text()) / 100),
				html = '',
				sjsn = '[',
				maxinserts = 50; // 淘宝限制一次sql 操作最多insert 50个数据

			for( var i=1; i<Math.min($trs.length,howm+1) && i<=maxinserts; i++ ){
				var $tds = $trs.eq(i).find('td'),
					id = $.trim($tds.eq(3).text()),
					pic = taobaoThumbPic($.trim($tds.eq(1).text())),
					msg =  $.trim($tds.eq(4).text()).replace(/^([\d\.]+%\s?)+/ig,'').replace(/[\n\t]/ig,' ').replace(/\"/ig,'\"'),
					plnk = $.trim($tds.eq(2).text()).replace(/^(.*)http:\/\//ig,'http://').replace(/^(.*)https:\/\//ig,'https://'),
					price = +($.trim($tds.eq(6).text())) || 0,
					coupon_price = +($.trim($tds.eq(5).text())) || 0,
					coupon = price > 0 && coupon_price > 0 ? Math.round(coupon_price*100 / price)/10 : 0,
					volume = Math.round($.trim($tds.eq(7).text()));

				// 解析href 获得淘宝id
				var id = plnk.indexOf('id=') > -1 ? parseInt(plnk.split('id=')[1]) : 0;

				sjsn += '{"idx":"'+idx+'","id":'+id+',"title":"'+msg+'","picUrl":"'+pic+'","price":"'+price+'","discountPrice":"'+coupon_price+'","volume":'+volume+'}' + (i+1<$trs.length ? ',':'');
				
				html += '<div class="pm-woo" data-id="'+id+'"><div class="pm-inner"><div class="pm-cont"><div class="pm-mbpho"><a href="'+plnk+'" target="_blank" ><img '+(!nodatasrc ? 'data-src':'src')+'="'+pic+'" /></a></div><div class="pm-desc"><div class="pm-g"><a href="'+plnk+'" target="_blank" >'+msg+'</a></div><div class="pm-sout">已售出<span>'+volume+'</span>件</div></div><div class="pm-item-detail"><a class="pm-price" target="_blank" href="'+plnk+'">￥'+coupon_price+'</a><i class="pm-discount-price">￥'+price+'</i></div>'+(coupon?'<div class="pm-nmcoup">'+coupon+'<u>折</u></div>':'')+(i<4 ? '<u class="pm-tmspe"></u>':'')+'</div></div></div><!-- item end -->'
			}
			sjsn += ']'
			return [html,sjsn];
		}

		// 转换所有tables 成 html字符串或 json 字符串
		function transAllTables($tables,howm){
			var html = '',
					sjsn = '';

			for( var j=0; j<$tables.length; j++ ){
				var $table = $tables.eq(j),
					$trs = $table.find('tr'),
					strhtml = transTableTo($table,false,howm);


				html += strhtml[0],
				sjsn += strhtml[1];

				html += '\n\n';
				sjsn += (j+1<$tables.length ? ',':'');
			}
			

			$('#conflresult').remove();

			$('<div id="conflresult"><div style="position:fixed;top:200px;left:0;z-index:99999;"><textarea class="confljson" style="width:100px;height:100px">'+sjsn.replace(/ /ig,' ')+'</textarea><div class="clr"><a class="abtn" href="javascript:;"><u>↑生成新代码</u></a></div><textarea class="conflfmat" style="width:100px;height:100px"></textarea></div><textarea  style="position:fixed;top:200px;right:0;z-index:99999;width:100px;height:100px">'+html.replace(/ /ig,' ')+'</textarea></div>')
			.appendTo('body')

			// json 格式的数据反转成 confluence 格式
			$('#conflresult').find('.abtn').click(function (e){
				var strjsn = $('#conflresult').find('.confljson').val(),
					jsn = JSON.parse(strjsn),
					idx = $tables.data('idx') || 0,
					$crs = $('#conflresult').find('.conflfmat'),
					cat = $.trim($tables.find('td:first').text()),
					crshd = '| '+cat+' | 图片链接 | 淘宝链接 | blogid | 标题 | 打折价 | 原价 | 售出 |';



				if( $.isArray(jsn) && jsn.length ){
					$(jsn).each(function (i,e){
						var id = e.id || 0,
							xh = 100*idx + 1 + i,
							title = e.title || '',
							picUrl = e.picUrl || '',
							price = e.price || 0,
							discountPrice = e.discountPrice || 0,
							volume = e.volume || 0;


						crshd += '\n| '+xh+' | '+picUrl+' | http://item.taobao.com/item.htm?id='+id+' | '+id+' | '+title+' | '+discountPrice+' | '+price+' | '+volume+' |'
					})

					$('#conflresult').find('.conflfmat').val(crshd);
				}

			})

		}





		var $tables = $('.confluenceTable'),
			timertable = null,
			timeritem = null,
			undefined;



		if( !$('#cx-tablecontedit').length ){
			$('<div id="cx-tablecontedit"></div>').appendTo('body');

			$('#cx-tablecontedit').bind('click',function (e){
				showEdit($(this).data('reltable'))
			})
		}

		$tables.add('#cx-tablecontedit').bind('mouseenter mouseover',function (e){
			var $te = $('#cx-tablecontedit'),
				$tb = $(this).is($te) ? $te.data('reltable') : $(this),
				ofs = $tb.offset();

			window.clearTimeout(timertable);

			$te.css({
				"display" : "block",
				"top" : ofs.top,
				"left" : ofs.left
			})
			.data('reltable',$tb)
		})
		.bind('mouseout mouseleave',function (e){
			window.clearTimeout(timertable);
			timertable = window.setTimeout(function (){
				$('#cx-tablecontedit').css({
					"display" : "none"
				})
				.removeData('reltable')
			},1000)
		})


		$tables.each(function (i,e){
			var $table = $(e);
			var idx = Math.floor(parseInt($table.find('tr:nth-child(2)').find('td:first').text()) / 100);
			$table.data('idx',idx)
		})


		// 单元块内容的可视化编辑
		$(document).delegate('.pm-appsortable .pm-woo','mouseenter mouseover',function (){
			var $itemed = $('#pm-vsitemedit'),
					$woo = $(this),
					ofs = $woo.offset();
			window.clearTimeout(timeritem);
			if( !$itemed.length ){
				$itemed = $('<div id="pm-vsitemedit"></div>')
				.click(function (e){
					e.preventDefault();
					e.stopPropagation();
					showItemEdit($(this).data('relwoo'));
				})
				.bind('mouseenter mouseover',function (){
					window.clearTimeout(timeritem);
				})
				.appendTo('body');
			}
			$itemed.css({
				"display" : "block",
				"left" : ofs.left + 240,
				"top" : ofs.top + 237
			})
			.data('relwoo',$woo)
		})
		.delegate('.pm-appsortable .pm-woo','mouseleave',function (){
			window.clearTimeout(timeritem);
			timeritem = window.setTimeout(function (){
				$('#pm-vsitemedit').css('display','none')
			},1000)
		})
		.delegate('#pm-holder-wrap','click',function (){
			$('#pm-wooedit').css('display','none');
		})

		// showEdit 弹出层，编辑单元块内容
		function showItemEdit($woo){
			var $wooedit = $('#pm-wooedit');

			if( !$wooedit.length ){
				$wooedit = $('<div id="pm-wooedit"><label>图片地址：</label><input type="text" id="pm-woo-pic" class="ipt" /><label>图片描述：</label><input type="text" id="pm-woo-desc" class="ipt" /><label>淘宝链接：</label><input type="text" id="pm-woo-link" class="ipt" /><label>打折价格：</label><input type="text" id="pm-woo-coupon" class="ipt" /><label>原本价格：</label><input type="text" id="pm-woo-price" class="ipt" /><a id="pm-woo-sub" class="abtn" href="javascript:;"><u>提交</u></a></div>')
				.appendTo('body')


				$('#pm-woo-sub').click(function (e){
					e.preventDefault();
					e.stopPropagation();
					var $woo = $('#pm-wooedit').data('relwoo').eq(0)
					$woo.find('.pm-mbpho img').attr('src',$('#pm-woo-pic').val());
					$woo.find('.pm-g a').text($('#pm-woo-desc').val());
					$woo.find('.pm-mbpho a').attr('href',$('#pm-woo-link').val());
					$woo.find('.pm-price').text('￥'+$('#pm-woo-coupon').val());
					$woo.find('.pm-item-detail i').text('￥'+$('#pm-woo-price').val());

					// 隐藏wooedit 编辑框
					$('#pm-wooedit').css('display','none');
				})
			}
			$wooedit.css({
				"display" : "block"
			})
			.data('relwoo',$woo)

			$('#pm-woo-pic').val($woo.find('.pm-mbpho img').attr('src') || '')
			$('#pm-woo-desc').val($woo.find('.pm-g a').text().replace(/^([\d\.]+%\s?)+/ig,''))
			$('#pm-woo-link').val($woo.find('.pm-mbpho a').attr('href') || '')
			$('#pm-woo-coupon').val($woo.find('.pm-price').text().replace(/^([\d\.]+%\s?)+/ig,'').replace(/[^\d\.]/ig,''))
			$('#pm-woo-price').val($woo.find('.pm-item-detail i').text().replace(/[^\d\.]/ig,''))
		}
	}

	chrome.extension.onRequest.addListener(function(message, sender, sendResponse){
	// change card name
			if( message.name == 'getneeded' ){
				transAllTables($('.confluenceTable'),message.howm);
			}

	})




	var location = window.location,
		isAliWay = location.hostname.indexOf('aliway\.com') > -1,
		undefined;

	if( !isAliWay ){
		return;
	}

//	// receive message from background.html
//	chrome.extension.onRequest.addListener(function(message, sender, sendResponse){
//		// change card name
//		if( message.name == 'getneeded' ){
//			changeMyCard(message.name)
//		}
//
//	})

	// pop iframe by dblclick document
//	$(document).dblclick(function (e){
//		popIframe();
//		setIframeContent($('html').html().replace(/<script [^>]*>.*<\/script>/ig,''))
//	})




	/*
	@说明： 弹出 iframe 层
	*/
	function popIframe(src){
		var $w = $(window),
			$pop = $('#pageiframewrap'),
			undefined;

		if( !$pop.length ){
			$pop = $('<div id="pageiframewrap"><a id="pageiframeclose" href="javascript:;">关闭</a><iframe id="pageiframe" src="'+(src ? src : 'about:blank')+'" frameborder="0" scrolling="yes" ></iframe></div>')
			.css("display","none")
			.appendTo('body');

			$(document).delegate('#pageiframeclose','click',function (e){
				removeIframe();
			})
		}
		$pop
		.css({
			"display" : "block",
			"height" : $w.height(),
			"top" : 0,
			"left" : 0
		})
	}

	/*
	@说明： 关闭 iframe 层
	*/
	function removeIframe(){
		$('#pageiframewrap').remove()
	}
	/*
	@说明： 设置iframe 里的content 内容
	*/
	function setIframeContent(cont){
		var ifrwin = $('#pageiframe').get(0).contentWindow,
			ifrdoc = ifrwin.document;
		ifrdoc.querySelectorAll('html')[0].innerHTML = cont;

		ifrdoc.querySelectorAll('body')[0].style.overflowX = 'hidden';
		var ifras = ifrdoc.querySelectorAll('a');
		for( var i=0; i<ifras.length; i++ ){
			ifras[i].onclick = function (){
				return false;
			}
		}
	}


	/*
	@说明：堆糖缩略图转换
	@参数：
	url      - (Str) 待处理的url地址
	t        - (Num) 转换类型  默认0-返回原图  1-返回缩略图
	w        - (Num) 返回缩略图的宽
	h        - (Num) 返回缩略图的高
	c        - (Bool) 是否截取正方形 a-左边截图  b-右边截图 c-中间截图
	*/
	function dtImageTrans(url,t,w,h,c){
		var pathn = $.trim(url).replace(/^http(s)?:\/\//ig,''),
			pathn = pathn.split('/'),
			domain = pathn[0],
			pathn = pathn[1];

		// 只有堆糖域名下 uploads misc 目录下的图片可以缩略
		if( domain.indexOf('duitang.com') == -1 || !pathn || pathn != 'uploads' && pathn != 'misc' ){
			return url;
		}
		if(t){
			w = w || 0;
			h = h || 0;
			c = c ? '_'+c : ''
			return dtImageTrans(url).replace(/(\.[a-z_]+)$/ig,'.thumb.'+w+'_'+h+c+'$1')
		}else{
			return url.replace(/(?:\.thumb\.\w+|\.[a-z]+!\w+)(\.[a-z_]+)$/ig,'$1')
		}
	}

	/*
	@说明： 更改签名图片
	@参数：
	name			- (Str) 签名图片对应的唯一name
	*/
	function changeMyCard(name){
		$('.tpc_content')
		.removeClass(function (i,cls){
			return (cls.match(/tpc_content_[\w_-]*/ig) || []).join(' ')
		})
		.addClass('tpc_content_'+name);
	}


})(window,document);


