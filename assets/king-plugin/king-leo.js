function selectThumb(item) {
	const thumb_aiz = document.getElementById("thumb_ai");
	thumb_aiz.value = item;
}
(function($) { 
	"use strict"; 

	$('#ai-submit').on('click', (event) => {
		event.preventDefault();

		const input = document.getElementById("ai-box");
		const { value } = input;
		const nprompt = document.getElementById("n_prompt");
		if (nprompt) {
			var npvalue = nprompt.value;
		} else {
			var npvalue = '';
		}

		const results = document.getElementById("ai-results");
		const {
			value: selectElement
		} = document.getElementById("ai-select");
		if (!value.trim()) {
			return;
		}
		var radioBut = $("input:radio[name=aisize]:checked").val();
		var aistyle = $("input:radio[name=aistyle]:checked").val();
		const submit = event.currentTarget;
		submit.disabled = true;
		input.disabled = true;
		submit.classList.add("loading");
		$.ajax({
			type: 'POST',
			url: leoai,
			dataType: 'json',
			data: {
				input: value,
				select: selectElement,
				radio: radioBut,
				style: aistyle,
				npvalue: npvalue,
			},
			success: (response) => {
				console.log(response);
				if (response.success) {
					const sresult = response.message;
					if (selectElement === 'sd') {
						var images = sresult.map(({
							base64
						}) => `<div class="ai-imgs" id="ai-imgs"><img src="data:image/png;base64, ${base64}"/><div id="king-aimg" data-saimg="${base64}"></div><a class="aidownl" title="Download" href="data:image/png;base64, ${base64}" download><i class="fa-solid fa-download"></i></a></div>`);
					} else {
						var images = sresult.map(({
							url
						}) => `<div class="ai-imgs" id="ai-imgs"><img src="${url}"/><div id="king-aimg" data-aimg="${url}"></div></div>`);
					}
					results.style.display = 'flex';
					let html = '<div class="ai-result">';
					html += '<div class="ai-result-up">';
					if (selectElement === 'sd') {
						html += '<span>Stable Diffusion</span>';
					}
					if (selectElement === 'de') {
						html += '<span>Dall-e</span>';
					}
					html += '<span>'+radioBut+'</span>';
					if (aistyle) {
						html += '<span>'+aistyle+'</span>';
					}
					html += '</div>';
					html += images.join('');
					html += '</div>';
					results.insertAdjacentHTML('afterbegin', html);
					input.disabled = false;
					submit.disabled = false;
					submit.classList.remove("loading");
					const textarea = document.getElementById("pcontent2");
					textarea.value = value;
					const npromp = document.getElementById("npromp");
					npromp.value = npvalue;
					if (aupload) {
						const kingAimgs = document.querySelectorAll('#king-aimg');
						kingAimgs.forEach((img) => {
							img.click();
						});
					}
				} else {
					results.innerHTML += response.data;
					input.disabled = false;
					submit.disabled = false;
					submit.classList.remove("loading");
				}
			}
		});
	});
	$(document).on('click', '#king-aimg', (event) => {
		const iurl = event.target.dataset.aimg;
		const siurl = event.target.dataset.saimg;
		if (!iurl && !siurl) {
			return;
		}
		event.target.classList.add("loading");
		$.ajax({
			type: 'POST',
			url: leoai,
			data: {
				iurl: iurl,
				siurl: siurl
			},
			success: (response) => {
				var e = JSON.parse(response);
				const aiimgs = document.getElementById("ai-form");
				const thumb_ai = document.getElementById("thumb_ai");
				event.target.classList.add("ldone");
				event.target.classList.remove("loading");
				var inp = document.createElement("INPUT");
				var radio = document.createElement("INPUT");
				var label = document.createElement("label");
				var rdiv = document.createElement("div");
				inp.setAttribute("type", "hidden");
				inp.setAttribute("name", "submit_image[]");
				inp.setAttribute("id", "submit_image_" + e.main);
				inp.setAttribute("value", e.main);
				radio.setAttribute("value", e.thumb);
				radio.setAttribute("type", "radio");
				radio.setAttribute("name", "thumbz");
				radio.setAttribute("id", "thumb_" + e.thumb);
				radio.setAttribute("class", "thumb-radio hide");
				radio.setAttribute("checked", true);
				label.setAttribute("title", "set as thumb");
				label.setAttribute("class", "thumb-radio-label");
				label.setAttribute("for", "thumb_" + e.thumb);
				label.setAttribute('onclick', 'selectThumb('+e.thumb+')');
				rdiv.setAttribute("id", "king-rimg");
				rdiv.setAttribute("data-rid", e.main);
				aiimgs.appendChild(inp);
				thumb_ai.value = e.thumb;
				event.target.parentElement.appendChild(radio);
				event.target.parentElement.appendChild(label);
				event.target.parentElement.appendChild(rdiv);
				delete event.target.dataset.aimg;
				delete event.target.dataset.saimg;
			},
			error: (xhr, status, error) => {
				console.error(error);
			}
		});
	});
	$(document).on('click', '#king-rimg', (event) => {
		const rid = event.target.dataset.rid;
		const ridt = rid - 1;
		var params={};
		params.thumbid = ridt;
		params.fileid  = rid;
		qa_ajax_post('mdelete', params,
			function (lines) {
				if (lines[0]=='0') {
					const cInput = document.getElementById('thumb_' + ridt);
					const closestLabel = document.querySelector('label.thumb-radio-label');
					if ( closestLabel && cInput.checked ) {
						closestLabel.click();
						const inputId = closestLabel.getAttribute('for');
						const correspondingInput = document.getElementById(inputId);
						if (correspondingInput) {
							correspondingInput.checked = true;
						}
					}
					const parentDiv = event.target.parentElement;
					parentDiv.remove();

					const inputToRemove = document.getElementById(`submit_image_${rid}`);
					if (inputToRemove) {
						inputToRemove.remove();
					}
					

					
					
				}
			}
			);
	});



	const selectBox = document.getElementById("ai-select");
	const selectedValue = document.getElementById("desizes");
var firstTabLink = document.querySelector('#ssize li:first-child a');


	if (selectBox) {
		selectBox.addEventListener("change", function() {
			selectedValue.className = selectBox.value;
			document.getElementById("aisize3").checked = true;
			const wai = document.getElementById("wai");
			wai.value = selectBox.value;
			// Remove the "active" class from all <li> elements


    // Trigger a click event on the first tab's <a> element
    firstTabLink.click();
		});
	}
	const radioButtons = document.getElementsByName('aistyle');
	const resultInput = document.getElementById('stle');
	radioButtons.forEach(radioButton => {
		radioButton.addEventListener('click', function() {
			resultInput.value = this.value;
		});
	});

	var Collapse = function(element, options) {
		this.$element = $(element)
		this.options = $.extend({}, Collapse.DEFAULTS, options)
		this.$trigger = $('[data-toggle="collapse"][href="#' + element.id + '"],' + '[data-toggle="collapse"][data-target="#' + element.id + '"]')
		this.transitioning = null
		if (this.options.parent) {
			this.$parent = this.getParent()
		} else {
			this.addAriaAndCollapsedClass(this.$element, this.$trigger)
		}
		if (this.options.toggle) this.toggle()
	}
Collapse.VERSION = '3.4.1'
Collapse.TRANSITION_DURATION = 350
Collapse.DEFAULTS = {
	toggle: true
}
Collapse.prototype.dimension = function() {
	var hasWidth = this.$element.hasClass('width')
	return hasWidth ? 'width' : 'height'
}
Collapse.prototype.show = function() {
	if (this.transitioning || this.$element.hasClass('in')) return
		var activesData
	var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')
	if (actives && actives.length) {
		activesData = actives.data('bs.collapse')
		if (activesData && activesData.transitioning) return
	}
var startEvent = $.Event('show.bs.collapse')
this.$element.trigger(startEvent)
if (startEvent.isDefaultPrevented()) return
	if (actives && actives.length) {
		Plugin.call(actives, 'hide')
		activesData || actives.data('bs.collapse', null)
	}
	var dimension = this.dimension()
	this.$element.removeClass('collapse').addClass('collapsing')[dimension](0).attr('aria-expanded', true)
	this.$trigger.removeClass('collapsed').attr('aria-expanded', true)
	this.transitioning = 1
	var complete = function() {
		this.$element.removeClass('collapsing').addClass('collapse in')[dimension]('')
		this.transitioning = 0
		this.$element.trigger('shown.bs.collapse')
	}
	if (!$.support.transition) return complete.call(this)
		var scrollSize = $.camelCase(['scroll', dimension].join('-'))
	this.$element.one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
}
Collapse.prototype.hide = function() {
	if (this.transitioning || !this.$element.hasClass('in')) return
		var startEvent = $.Event('hide.bs.collapse')
	this.$element.trigger(startEvent)
	if (startEvent.isDefaultPrevented()) return
		var dimension = this.dimension()
	this.$element[dimension](this.$element[dimension]())[0].offsetHeight
	this.$element.addClass('collapsing').removeClass('collapse in').attr('aria-expanded', false)
	this.$trigger.addClass('collapsed').attr('aria-expanded', false)
	this.transitioning = 1
	var complete = function() {
		this.transitioning = 0
		this.$element.removeClass('collapsing').addClass('collapse').trigger('hidden.bs.collapse')
	}
	if (!$.support.transition) return complete.call(this)
		this.$element[dimension](0).one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION)
}
Collapse.prototype.toggle = function() {
	this[this.$element.hasClass('in') ? 'hide' : 'show']()
}
Collapse.prototype.getParent = function() {
	return $(document).find(this.options.parent).find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]').each($.proxy(function(i, element) {
		var $element = $(element)
		this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
	}, this)).end()
}
Collapse.prototype.addAriaAndCollapsedClass = function($element, $trigger) {
	var isOpen = $element.hasClass('in')
	$element.attr('aria-expanded', isOpen)
	$trigger.toggleClass('collapsed', !isOpen).attr('aria-expanded', isOpen)
}

function getTargetFromTrigger($trigger) {
	var href
	var target = $trigger.attr('data-target') || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')
	return $(document).find(target)
}

function Plugin(option) {
	return this.each(function() {
		var $this = $(this)
		var data = $this.data('bs.collapse')
		var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)
		if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
			if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
				if (typeof option == 'string') data[option]()
			})
}
var old = $.fn.collapse
$.fn.collapse = Plugin
$.fn.collapse.Constructor = Collapse
$.fn.collapse.noConflict = function() {
	$.fn.collapse = old
	return this
}
$(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function(e) {
	var $this = $(this)
	if (!$this.attr('data-target')) e.preventDefault()
		var $target = getTargetFromTrigger($this)
	var data = $target.data('bs.collapse')
	var option = data ? 'toggle' : $this.data()
	Plugin.call($target, option)
})
})(jQuery);