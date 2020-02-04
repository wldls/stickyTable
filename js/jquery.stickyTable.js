(function($){
	var defaults = {
		headerName : '#header',
		fixedName: '.head_fixed',
		stickyCellName : '.sticky_cell',
		stickyCellTop : '.sticky_cell.top',
		stickyCellEmpty : '',
		left: 0,
		right: 0,
		isFloatingScroll:true,
		isOuterScroll:true,
		waitTimer: 250
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

			that.scrollVisible = true;
			that.skipSyncContainer = that.skipSyncWidget = false;

			if(opt.isOuterScroll){
				// scroll top sticky-header 생성
				var cloneHeader = $element.find('thead').clone();				
				var html = ' <div class="head_fixed on">';
					html += '	<table>';
					html += 	cloneHeader[0].outerHTML;
					html += '	</table>';
					html += '</div>';
							
				$element.prepend(html);				
			}
			
			var $fixed = $element.find(opt.fixedName);

			// left cell을 고정하고 싶은 경우
			if(opt.left > 0){
				that.stickyLeft();
			}

			// right cell을 고정하고 싶은 경우
			if(opt.right > 0){
				that.stickyRight();
			}

			// 브라우저 y축 스크롤을 움직일 때 x축 스크롤을 항상 붙일지 여부에 따라 함수 실행
			if(opt.isFloatingScroll){
				that.floatingScroll();				
			}

			(function(){
				// 브라우저 넓이에 따라 table 넓이와 sticky header 넓이가 동일하게 유지
				function resizeDone(){				
					$fixed.css('width', $element[0].offsetWidth);
				}
	
				resizeDone();

				var timer = null;
				$(window).on('resize',function(e){
					// waitTimer 밀리초마다 resize실행 여부를 확인
					clearTimeout(timer);
					timer = setTimeout(resizeDone, opt.waitTimer);
				});

				// 상하 스크롤에 따라 thead가 fixed되도록 함
				that.stickyHeader();
				var move = that.scrollMoveLeft();

				$(window).on('scroll', function(){
					// 브라우저 스크롤과 sticky header 좌우 스크롤 동기화
					var left = $(window).scrollLeft();
					
					that.stickyHeader();

					if(opt.isFloatingScroll){
						that.resizeScroll();
						that.checkVisibility();
					}

					// 좌우 스크롤 동기화
					move(left);
				});
			})()

			$element.on('scroll', function(){
				// table과 sticky header 좌우 스크롤 동기화
				var scrollLeftPos = $element.scrollLeft();
				
				$fixed.find('table').css('margin-left',-scrollLeftPos);

				if(opt.isFloatingScroll && !that.skipSyncWidget){
					that.syncWidget();
					that.skipSyncWidget = false;
				}
			});
		},
		stickyHeader: function(){
			// 스크롤 시 테이블 헤더 고정
			var that = this,
				opt = that.options,
				$element = that.e,
				$fixed = $element.find(opt.fixedName),
				scrollTop = $(window).scrollTop(),
				tblOfsTop = $element.offset().top;				

			if(scrollTop > tblOfsTop){
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

			var beforeScrollLeft  = 0;

			return function(afterScrollLeft){

				if(beforeScrollLeft !== afterScrollLeft){
					// 브라우저 좌우 스크롤 이동시 실행
					var $headFixed = $(opt.fixedName),					
						$headLeftCell = $(opt.fixedName).find(opt.stickyCellTop+'[data-fix="left"]'),	// left 이동
						$headRightCell = $(opt.fixedName).find(opt.stickyCellTop+'[data-fix="right"]'),	// right 이동
						moveLeft = $element.offset().left - afterScrollLeft,						
						elementMarginLeft = $element.offset().left - $element[0].offsetLeft;

					// tbl_sticky가 이동된 만큼 head도 이동
					$headFixed.css('left', moveLeft);					

					// 0번째는 width가 아닌 element위치가 기준
					$headLeftCell.eq(0).css('left', elementMarginLeft - afterScrollLeft);

					// fixed된 stickyCell left 값 조정
					$headLeftCell.each(function(idx, item){
						if(idx !== 0){
							var stickyCellWidth = $(item).outerWidth();

							if(opt.stickyCellEmpty === ''){
								$(item).css('left', moveLeft - stickyCellWidth + 1);								
							}else{
								$(item).add(opt.stickyCellEmpty).css('left', moveLeft - stickyCellWidth + 1);
							}	
						}						
					});

					$headRightCell.each(function(idx, item){
						var cellPosRight = parseInt($(item).css('right').replace('px'));
						var move = afterScrollLeft - beforeScrollLeft;

						if(opt.stickyCellEmpty === ''){
							$(item).css('right', cellPosRight + move + 'px');								
						}else{
							$(item).add(opt.stickyCellEmpty).css('left', cellPosRight + move + 'px');
						}
					});

					beforeScrollLeft = afterScrollLeft;
				}
			}
		},		
		stickyLeft:function(){
			var that = this,
				opt = that.options,
				$element = that.e,
				$fixed = $element.find(opt.fixedName),
				totCellWidth = 0,
				cellPosLeft = 0,
				className = opt.stickyCellName.replace(/\./g, ' ').trim(),
				classTopName = opt.stickyCellTop.replace(/\./g, ' ').trim()
				tblPos = $element[0].getBoundingClientRect().left; // table left 위치
			
			for(var i = 1; i <= opt.left; i++){				
				// 해당 셀에 sticky_cell 클래스 붙이기
				$element.find('th:nth-child('+i+')').addClass(classTopName).attr('data-fix', 'left');
				$element.find('td:nth-child('+i+')').addClass(className).attr('data-fix', 'left');

				var j = i - 1, // i 0번째부터 시작
					stickyCell = $(opt.stickyCellName)[j],
					eachCellWidth = stickyCell.offsetWidth;	// 각 sticky_cell의 width 값
						
				// 모든 sticky_cell width 더한 값
				totCellWidth += (eachCellWidth - 1);

				if(j === 0){
					$fixed.find(opt.stickyCellTop + ':nth-child(1)').css('left', tblPos + 'px');
				} else if(j >= 1){
					// 두 번째 셀부터 position left값 적용
					var beforeCellWidth = stickyCell.previousElementSibling.offsetWidth - 1;
					
					cellPosLeft = cellPosLeft += beforeCellWidth;

					$(opt.stickyCellTop + ':nth-child('+ i +')').css('left', cellPosLeft + 'px');
					$(opt.stickyCellName + ':nth-child('+ i +')').css('left', cellPosLeft + 'px');

					// fixed_header의 경우 fixed값이므로 table left값을 추가
					$fixed.find(opt.stickyCellTop + ':nth-child('+ i +')').css('left', cellPosLeft + tblPos + 'px');
				}
			}

			// sticky_cell갯수만큼 margin-left 설정
			$element.css({'margin-left':totCellWidth});
		},
		stickyRight: function(){
			var that = this,
				opt = that.options,
				$element = that.e,
				$fixed = $element.find(opt.fixedName),
				totCellWidth = 0,
				classTopName = opt.stickyCellTop.replace(/\./g, ' ').trim(),
				className = opt.stickyCellName.replace(/\./g, ' ').trim(),
				tblPos = $(window).width() - $element[0].getBoundingClientRect().right, // table right 위치
				totalCellCount = $element.find('table')[0].rows[0].cells.length;	// cell 갯수
			
			for(var i = 1; i <= opt.right; i++){
				var rightCount = totalCellCount - (i - 1);

				// 해당 셀에 sticky_cell 클래스 붙이기
				$element.find('th:nth-child('+ rightCount +')').addClass(classTopName).attr('data-fix', 'right');
				$element.find('td:nth-child('+ rightCount +')').addClass(className).attr('data-fix', 'right');
				
				var stickyCell = $(opt.stickyCellName+'[data-fix="right"]')[i],
					eachCellWidth = stickyCell.offsetWidth;	// 각 sticky_cell의 width 값

				// 모든 sticky_cell width 더한 값
				totCellWidth += (eachCellWidth - 1);

				// 맨 뒤에서 두 번째 셀부터 position right 적용
				if(rightCount < totalCellCount){
					var cellPosRight = totCellWidth - eachCellWidth;

					$(opt.stickyCellTop + ':nth-child('+ rightCount +')').css('right', cellPosRight + 'px');
					$(opt.stickyCellName + ':nth-child('+ rightCount +')').css('right', cellPosRight + 'px');

					// fixed_header의 경우 fixed값이므로 table left값을 추가
					$fixed.find(opt.stickyCellTop + ':nth-child('+ rightCount +')').css('right', cellPosRight + tblPos + 'px');
				}else{
					// 맨 마지막은 table이 기본값
					$fixed.find(opt.stickyCellTop + ':nth-child('+ totalCellCount +')').css('right', tblPos + 'px');
				}
			}

			// sticky_cell갯수만큼 margin-left 설정
			$element.css({'margin-right':totCellWidth});
		},
		floatingScroll: function(){
			// 항상 element 하단에 붙는 가로 스크롤 막대 생성
			var that = this,
				$element = that.e;
				widget = that.widget = $("<div class='fl-scrolls'></div>"); 

			// fl-scrolls 하위에 div 생성
			$("<div></div>").appendTo(widget).css({width:$element[0].scrollWidth+'px'});

			// $element에 widget 추가
			widget.appendTo($element);

			// widget scroll 생성
			that.resizeScroll();

			// floatingScroll show hide 여부 확인
			that.checkVisibility();

			// scroll 동기화
			widget.on('scroll', function(){
				if (that.scrollVisible && !that.skipSyncContainer) {
					that.syncContainer();
				}

				that.skipSyncContainer = false;
			});
		},
		resizeScroll: function(){
			// 스크롤 넓이 또는 $elememt 크기가 변형될 때 다시 계산
			var that = this,
				$element = that.e,
				widget = that.widget,
				clientWidth = $element[0].clientWidth,
				scrollWidth = $element[0].scrollWidth;

				// widget 넓이, left position 설정
				widget.width(clientWidth).css('left', $element[0].getBoundingClientRect().left + 'px');

				// widget div width
				$("div", widget).width(scrollWidth);

				// 보이는 영역보다 실제 컨텐츠 영역이 크면 width height 값 추가
				if (scrollWidth > clientWidth) {
					// +1px JIC
					widget.height(widget[0].offsetHeight - widget[0].clientHeight + 1);
				}
		},
		syncContainer: function(){
			var that = this,
				$element = that.e,
				scrollLeft = that.widget[0].scrollLeft;
			
			if($element[0].scrollLeft !== scrollLeft){
				// element의 스크롤이벤트 핸들러가 위젯 스크롤 위치를 다시 동기화하지 못하도록 방지
				that.skipSyncWidget = true;

				// element의 스크롤이 widget의 스크롤의 위치가 같도록 조정
				$element[0].scrollLeft = scrollLeft;
			}
		},
		syncWidget: function(){
			var that = this,
				$element = that.e,
				contScrollLeft = $element[0].scrollLeft,
				scrollLeft = that.widget[0].scrollLeft;

			if(scrollLeft !== contScrollLeft){
				// widget의 스크롤이벤트 핸들러가 위젯 스크롤 위치를 다시 동기화하지 못하도록 방지
				that.skipSyncContainer = true;

				// widget의 스크롤이 elememt스크롤의 위치가 같도록 조정
				that.widget[0].scrollLeft = contScrollLeft;
			}
		},
		checkVisibility: function(){
			var that = this,
				$element = that.e,
				widget = that.widget,
				mustHide = (widget[0].scrollWidth <= widget[0].offsetWidth);

			// widget 실제 넓이보다 보이는 넓이가 크면 숨김처리
			if(!mustHide){
				var elementRect = $element[0].getBoundingClientRect();	// element 좌표
				var maxVisibleY = window.innerHeight || document.documentElement.clientHeight;	// 브라우저 높이

				//세로 스크롤이 element 범위를 넘어가면 hide
				mustHide = ((elementRect.bottom <= maxVisibleY) || (elementRect.top > maxVisibleY));
			}

			if (that.scrollVisible === mustHide) {
				that.scrollVisible = !mustHide;
				// 가로 스크롤일때는 반영되지 않음
				widget.toggleClass("fl-scrolls-hidden");
			}
		}
	}

	$.fn.stickyTable = function(options){
		return this.each(function(){
			var plugin = new Plugin(this, options);
		});
	};	
}(jQuery));