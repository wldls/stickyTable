## stickyTable
> 프로젝트

### Useage
<pre>
<code>$('.tbl_wrap').stickyTable();</code>
</pre>

### Options
<table>
<thead>
<tr>
<th align="left">name</th>
<th align="left">type</th>
<th align="left">default</th>
<th align="left">description</th>
</tr>
</thead>
<tbody>
<tr>
<td>container</td>
<td>string</td>
<td>'.sticky_wrap'</td>
<td rowspan="6">클래스 명을 원하는 형식으로 변경 가능</td>
</tr>
<tr>
<td>headerName</td>
<td>string</td>
<td>'#header'</td>
</tr>
<tr>
<td>fixedName</td>
<td>string</td>
<td>'.head_fixed'</td>
</tr>
<tr>
<td>stickyCellName</td>
<td>string</td>
<td>'.sticky_cell'</td>
</tr>
<tr>
<td>stickyCellTop</td>
<td>string</td>
<td>'.sticky_cell.top'</td>
</tr>
<tr>
<td>stickyCellEmpty</td>
<td>string</td>
<td>''</td>
</tr>
<tr>
<td>left</td>
<td>number</td>
<td>0</td>
<td>좌측 셀 고정값</td>
</tr>
<tr>
<td>right</td>
<td>number</td>
<td>0</td>
<td>우측 셀 고정값</td>
</tr>
<tr>
<td>isFloatingScroll</td>
<td>boolean</td>
<td>true</td>
<td>브라우저 스크롤을 했을 경우 테이블 가로축 스크롤을 항상 띄워줄 것인지 여부 확인</td>
</tr>
<tr>
<td>isOuterScroll</td>
<td>boolean</td>
<td>true</td>
<td>브라우저 세로축 스크롤을 할 경우 theader를 고정시킬지 여부 확인</td>
</tr>
<tr>
<td>waitTimer</td>
<td>number</td>
<td>100</td>
<td>window resize 할 경우 정해진 시간마다 resize관련 함수 실행</td>
</tr>
</tbody>
</table>