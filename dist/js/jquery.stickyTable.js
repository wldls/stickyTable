(function($){
	var defaults = {
		headerName : '#header',
		fixedName: '.head_fixed',
		stickyCellName : '.sticky_cell',
		stickyCellTop : '.sticky_cell.top',
		stickyCellEmpty : '',
		left: 3,
		right: 0,
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
				$element = that.e;

			// scroll top sticky-header 생성
			var cloneHeader = $element.find('thead').clone();				
			var html = ' <div class="head_fixed on">';
				html += '	<table>';
				html += 	cloneHeader[0].outerHTML;
				html += '	</table>';
				html += '</div>';
						
			$element.prepend(html);
			
			var $fixed = $element.find(opt.fixedName);

			// left 고정값이 있는 경우
			if(opt.left > 0){
				that.stickyLeft();
			}
				
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
				fixedStart = tblOfsTop;

			if(scrollTop > fixedStart){
				// thead높이보다 스크롤 높이가 높은 경우 fixed div show
				$fixed.addClass('on');

			}else{
				$fixed.removeClass('on');
			}
		},		
		stickyLeft:function(){
			var that = this,
				opt = that.options,
				$element = that.e;

			var totCellWidth = 0;		
			var test = 0;

			for(var i = 1; i <= opt.left; i++){
				var $th = $element.find('th:nth-child('+i+')'),
					$td = $element.find('td:nth-child('+i+')'),
					className = 'sticky_cell',					
					j = i-1; // i 0번째부터 시작

				// 해당 셀에 sticky_cell 클래스 붙이기
				$th.addClass(className);
				$td.addClass(className);
				
				var eachCellWidth = $('.'+className).eq(j).outerWidth();	// 각 sticky_cell의 width 값
				var posFstLeft = parseInt($('.'+className).css('left').replace('px',''));	// sticky_cell position left기본값

				// 모든 sticky_cell width 더한 값
				totCellWidth += (eachCellWidth - 1);

				// 두 번째 셀부터 position left값 적용
				if(j >= 1){
					var beforeCellWidth = $('.'+className).eq(j).prev().outerWidth() - 1;
					test = test += beforeCellWidth;

					$('.'+className+':nth-child('+i+')').css('left', test + posFstLeft + 'px');
				}
			}

			// sticky_cell갯수만큼 margin-left 설정, margin-left값만큼 width 값 줄어듦
			var elWidth = $element.outerWidth();
			$element.css({'width':elWidth - totCellWidth, 'margin-left':totCellWidth});

		},
		scrollMoveLeft : function(){
			// 브라우저 스크롤 시 테이블 헤더 동기화
			var that = this,
				opt = that.options,
				$element = that.e;

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