/*



	File: king-content/king-page.js
	Version: See define()s at top of king-include/king-base.php
	Description: Common Javascript including voting, notices and favorites


	This program is free software; you can redistribute it and/or
	modify it under the terms of the GNU General Public License
	as published by the Free Software Foundation; either version 2
	of the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	More about this license: LICENCE.html
*/
function qa_reveal(elem, type, callback) {
	if (elem) $(elem).slideDown(400, callback);
}

function qa_conceal(elem, type, callback) {
	if (elem) $(elem).slideUp(400);
}

function qa_set_inner_html(elem, type, html) {
	if (elem) elem.innerHTML = html;
}

function qa_set_outer_html(elem, type, html) {
	if (elem) {
		var e = document.createElement('div');
		e.innerHTML = html;
		elem.parentNode.replaceChild(e.firstChild, elem);
	}
}

function qa_show_waiting_after(elem, inside) {
	if (elem && !elem.qa_waiting_shown) {
		var w = document.getElementById('king-waiting-template');
		if (w) {
			var c = w.cloneNode(true);
			c.id = null;
			if (inside) elem.insertBefore(c, null);
			else elem.parentNode.insertBefore(c, elem.nextSibling);
			elem.qa_waiting_shown = c;
		}
	}
}

function qa_hide_waiting(elem) {
	var c = elem.qa_waiting_shown;
	if (c) {
		c.parentNode.removeChild(c);
		elem.qa_waiting_shown = null;
	}
}

function qa_vote_click(elem) {
	var ens = elem.name.split('_');
	var postid = ens[1];
	var vote = parseInt(ens[2]);
	var code = elem.form.elements.code.value;

	qa_ajax_post('vote', {
		postid: postid,
		vote: vote,
		code: code
	}, function(lines) {
		if (lines[0] == '1') {
			qa_set_inner_html(document.getElementById('voting_' + postid), 'voting', lines.slice(1).join("\n"));
		} else if (lines[0] == '0') {
			var mess = document.getElementById('errorbox');
			if (!mess) {
				var mess = document.createElement('div');
				mess.id = 'errorbox';
				mess.className = 'king-error';
				mess.innerHTML = lines[1];
				mess.style.display = 'none';
			}
			var postelem = document.getElementById('insertfooter');
			var e = postelem.parentNode.insertBefore(mess, postelem);
			qa_reveal(e);
		} else qa_ajax_error();
	});
	return false;
}

function qa_notice_click(elem) {
	var ens = elem.name.split('_');
	var code = elem.form.elements.code.value;
	qa_ajax_post('notice', {
		noticeid: ens[1],
		code: code
	}, function(lines) {
		if (lines[0] == '1') qa_conceal(document.getElementById('notice_' + ens[1]), 'notice');
		else if (lines[0] == '0') alert(lines[1]);
		else qa_ajax_error();
	});
	return false;
}

function qa_favorite_click(elem) {
	var ens = elem.name.split('_');
	var code = elem.form.elements.code.value;
	qa_ajax_post('favorite', {
		entitytype: ens[1],
		entityid: ens[2],
		favorite: parseInt(ens[3]),
		code: code
	}, function(lines) {
		if (lines[0] == '1') {
			qa_set_inner_html(document.getElementById('favoriting'), 'favoriting', lines.slice(1).join("\n"));
		} else if (lines[0] == '0') {
			alert(lines[1]);
			qa_hide_waiting(elem);
		} else {
			qa_ajax_error();
		}
	});
	qa_show_waiting_after(elem, false);
	return false;
}

function qa_favorite_click2(elem) {
	var ens = elem.name.split('_');
	var code = elem.form.elements.code.value;
	qa_ajax_post('follow', {
		entitytype: ens[1],
		entityid: ens[2],
		favorite: parseInt(ens[3]),
		code: code
	}, function(lines) {
		if (lines[0] == '1') qa_set_inner_html(document.getElementById('follow_' + ens[2]), 'follow_' + ens[2], lines.slice(1).join("\n"));
		else if (lines[0] == '0') {
			alert(lines[1]);
			qa_hide_waiting(elem);
		} else qa_ajax_error();
	});
	qa_show_waiting_after(elem, false);
	return false;
}

function qa_ajax_post(operation, params, callback) {
	$.extend(params, {
		qa: 'ajax',
		qa_operation: operation,
		qa_root: qa_root,
		qa_request: qa_request
	});
	$.post(qa_root, params, function(response) {
		var header = 'QA_AJAX_RESPONSE';
		var headerpos = response.indexOf(header);
		if (headerpos >= 0) callback(response.substr(headerpos + header.length).replace(/^\s+/, '').split("\n"));
		else callback([]);
	}, 'text').fail(function(jqXHR) {
		if (jqXHR.readyState > 0) callback([])
	});
}

function qa_ajax_error() {
	alert('Unexpected response from server - please try again or switch off Javascript.');
}

function qa_display_rule_show(target, show, first) {
	var e = document.getElementById(target);
	if (e) {
		if (first || e.nodeName == 'SPAN') e.style.display = (show ? '' : 'none');
		else if (show) $(e).fadeIn();
		else $(e).fadeOut();
	}
}


function followTc(elem) {
	var params = {};
	params.id = elem.getAttribute('data-id');
	params.type = elem.getAttribute('data-type');
	qa_ajax_post('follow_tc', params, function(lines) {
		if (lines[0] == '1') {
			elem.classList.remove('nfllowing');
			elem.classList.add('fllowing');
			elem.children[1].innerHTML = lines.slice(1).join("\n");
		} else {
			elem.classList.remove('fllowing');
			elem.classList.add('nfllowing');
			elem.children[1].innerHTML = lines.slice(1).join("\n");
		}
	});

	return false;
}

function showResult(str) {
	var params = {};
	if (str.length >= 3) {
		params.result = str;
		qa_ajax_post('live_search', params, function(lines) {
			document.getElementById("king_live_results").innerHTML = lines.slice(1).join("\n");
		});
	}
	return false;
}
if ("undefined" != typeof localStorage) {
	$(window).load(function() {
		JSON.parse(localStorage.getItem("king-night")) && (document.documentElement.classList.add("king-night"), document.getElementById("king-night").checked = !0);
		$("#king-night").change(function() {
			if ($(this).is(":checked")) {
				document.documentElement.classList.add("king-night");
				var b = document.getElementById("king-night");
				localStorage.setItem("king-night", b.checked)
			} else document.documentElement.classList.remove("king-night"), localStorage.removeItem("king-night")
		})
	});
	try {
		$(window).load()
	} catch (b) {}
}
$('.btn-switch').click(function(e) {
 e.stopPropagation();
});
function makeVerify(elem) {
	var params = {};
	params.userid = elem.getAttribute('data-userid');
var alink = document.getElementsByClassName('user-box-alink');
	qa_ajax_post('make_verify', params, function(lines) {
		if (lines[0] == '1') {
			elem.classList.remove('nverified');
			elem.classList.add('verified');
			alink[0].classList.add('averified');
		} else {
			elem.classList.remove('verified');
			elem.classList.add('nverified');
			alink[0].classList.remove('averified');
		}
	});

	return false;
}
function pollclick(item) {
	var params = {};
	params.id = $(item).data('id');
	params.pid = $(item).data('pollid');
	var tvotes = document.getElementById('kpoll_' + params.pid);
	var lis = tvotes.getElementsByTagName("li");
	var cvoted = $(item).data('voted');
	qa_ajax_post('poll_click', params, function(lines) {
		if (lines[0] == '1') {
			tvotes.classList.remove('not-voted');
			tvotes.classList.add('voted');

			item.dataset.voted = cvoted + 1;
			for (var i = 0; i < lis.length; i++) {
				var thisDiv = lis[i];
				var voted = thisDiv.getAttribute('data-voted');
				var ids = thisDiv.getAttribute('data-id');
				var results = thisDiv.querySelector('.poll-result');
				var resultp = thisDiv.querySelector('.poll-result-percent');
				var resultn = thisDiv.querySelector('.poll-result-voted');
				var votes = thisDiv.getAttribute('data-votes');
				asd = Math.round(100 * voted / votes);
				results.style.width = asd + '%';
				results.style.height = asd + '%';
				resultp.innerHTML = asd + '%';
				resultn.innerHTML = ' <i class="fas fa-poll-h"></i> ' + voted;
			}
			console.log('done');
		} else {
			console.log('undone');
		}
	});
}

function triviaclick(item) {
	var params = {};
	var t = $(item);
	var crrct = t.data('id');
	var ul = t.parent().parent();
	var p = ul.data('parent');
	var vt = ul.data('voted');
	if (0 === vt) {
		ul.addClass('voted');
		if ( crrct == '1' ) {
			t.addClass('correct');
		} else {
			t.addClass('not-correct');
		}
	}
	ul.data('voted', 1);
	if ($('.king-polls.voted').length == p) {
		params.ttl = p;
		params.cc  = $('.poll-item.correct').length;
		params.pid = ul.data('postid');
		qa_ajax_post('trivia_click', params, function(lines) {
		if (lines[0] == '1') {
			var l = document.getElementById('king-quiz-result');
			l.innerHTML = lines.slice(1).join("\n");
		}
		});
	}
}
function memnext() {
  var element = document.getElementById("membership");
  element.classList.toggle("step-2");
}

function bookmark(elem) {
	var params = {};

	params.id = elem.getAttribute('data-bookmarkid');

	qa_ajax_post('bookmark', params, function(lines) {
		var x = document.getElementById('bcount');
		var z = x.value;
		var y = document.getElementById('bcounter');
		if (lines[0] == '1') {
			elem.classList.toggle('selected');
			let t = parseInt(z) + 1;

			y.innerText = t;
			x.value = t;
		} else {
			elem.classList.toggle('selected');
			let t = parseInt(z) - 1;

			y.innerText = t;
			x.value = t;
		}
	});

	return false;
}
function bookmodal() {
	var params = {};

	params.modal = true;

	qa_ajax_post('bookmark', params, function(lines) {
		if (lines[0] == '1') {
			var l = document.getElementById('king-rlater-inside');
			l.innerHTML = lines.slice(1).join("\n");

		}
	});

	return false;
}
