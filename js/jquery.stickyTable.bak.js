(function($){
	var defaults = {
		headerName : '#header',
		fixedName: '.head_fixed',
		stickyCellName : '.sticky_cell',
		stickyCellTop : '.sticky_cell.top',
		stickyCellEmpty : '',
		waitTimer: 100
	}

	function Plugin(element, options){		
		this.w = $(document);
		this.e = $(element);		
		this.options = $.extend({}, defaults, options);
		this.init();
	}

	Plugin.prototype = {
		init: function(){
			var that = this,
				opt = that.options,
				$element = that.e,
				$fixed = $element.find(opt.fixedName);

			// 브라우저 넓이에 따라 table 넓이와 sticky header 넓이가 동일하게 유지
			function resizeDone(){				
				$fixed.css('width', $element.outerWidth());
			}		

			resizeDone();
			
			// resize throttle사용
			$(window).on('resize', _.throttle(resizeDone, opt.waitTimer));

			// 상하 스크롤에 따라 thead가 fixed되도록 함
			that.stickyHeader();
				
			$(window).on('scroll', _.throttle(function(){
				that.stickyHeader();
			}, opt.waitTimer));

			// 좌우 스크롤 동기화 : 스크롤 이동속도와 정확하게 일치해야 하므로 throttle은 사용하지 않음
			var move = that.scrollMoveLeft();
			$(window).on('scroll', function(){
				// 브라우저 스크롤과 sticky header 좌우 스크롤 동기화
				var left = $(window).scrollLeft();
				
				move(left);
			});

			$element.on('scroll', function(){
				// table과 sticky header 좌우 스크롤 동기화
				var scrollLeftPos = $element.scrollLeft();
				
				$fixed.find('table').css('margin-left',-scrollLeftPos);
			});
		},
		stickyHeader: function(){
			// 스크롤 시 테이블 헤더 고정
			var that = this,
				opt = that.options,
				$element = that.e,
				$fixed = $element.find(opt.fixedName);
				
			var scrollTop = $(window).scrollTop(),
				tblOfsTop = $element.offset().top,
				headerHeight = $(opt.headerName).outerHeight(),
				fixedStart = tblOfsTop - headerHeight;

			if(scrollTop > fixedStart){
				// thead높이보다 스크롤 높이가 높은 경우 fixed div show
				$fixed.addClass('on');
			}else{
				$fixed.removeClass('on');
			}
		},		
		scrollMoveLeft : function(){
			// 브라우저 스크롤 시 테이블 헤더 동기화
			var that = this,
				opt = that.options,
				$element = that.e;
				// $fixed = $element.find(opt.fixedName);

			var beforeScrollLeft  = 0;
			var stickyCellWidth = $(opt.stickyCellTop + ':visible').outerWidth();

			return function(afterScrollLeft){

				if(beforeScrollLeft !== afterScrollLeft){
					// 브라우저 좌우 스크롤 이동시 실행

					var $headFixed = $(opt.fixedName),					
						$headStickyCell = $(opt.fixedName).find(opt.stickyCellTop),
						moveLeft = $element.offset().left - afterScrollLeft;

					// tbl_sticky가 이동된 만큼 head도 이동
					$headFixed.css('left', moveLeft);

					if(opt.stickyCellEmpty === ''){
						$headStickyCell.css('left', moveLeft - stickyCellWidth + 1);
					}else{
						$headStickyCell.add(opt.stickyCellEmpty).css('left', moveLeft - stickyCellWidth + 1);
					}

					beforeScrollLeft = afterScrollLeft;
				}
			}
		}
	}

	$.fn.stickyTable = function(options){
		return this.each(function(){
			var plugin = new Plugin(this, options);
		});
	};	
}(jQuery));