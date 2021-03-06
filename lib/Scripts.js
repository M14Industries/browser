function fetch(name, selector, value) {
	return new Promise(resolve => {

		let script;

		if (name == "html") {
			script = `
				function(){ 
					return document.documentElement.outerHTML;
				}`;
		}

		if (name == "query") {
			script = `
				function(){ 
					return document.querySelectorAll("${selector}").length !== 0; 
				}`;
		}

		if (name == "fill") {

			if (typeof value === "string") {
				value = value.replace(/'/g, "\\'");
			}

			script = `
				function(){ 
					var fillObj = document.querySelectorAll("input[name='${selector}'],input${selector},textarea[name='${selector}'],textarea${selector}")[0];
					fillObj.value = '${value}'; 
					var event = new Event('change');
					fillObj.dispatchEvent(event);
				}`;
		}

		if (name == "select") {
			script = `
				function(){ 
					var selectObj = document.querySelectorAll("select[name='${selector}'],select${selector}")[0];
					
					for (var i = 0; i < selectObj.options.length; i++) { 
						if (selectObj.options && selectObj.options[i] && ((selectObj.options[i].text == '${value}') || (selectObj.options[i].value == '${value}'))) { 
							selectObj.options[i].selected = true;
							var event = new Event('change');
							selectObj.dispatchEvent(event);
							return;
						}
					}
				}`;
		}

		if (name == "choose") {
			script = `
				function(){ 
					var inputObjs = document.querySelectorAll("input[name='${selector}'],input${selector}"); 

					if (inputObjs.length == 1) { 
						inputObjs[0].checked = true;

						var event = new Event('change');
						inputObjs[0].dispatchEvent(event);
						return;
					} 

					if (inputObjs.length == 0) {
						inputObjs = document.querySelectorAll("input[type=radio]"); 
					}

					for (var i = 0; i < inputObjs.length; i++) {
						if (inputObjs[i] && ((inputObjs[i].value == '${selector}') || (inputObjs[i].value == '${value}'))) { 
							inputObjs[i].checked = true;
							var event = new Event('change');
							inputObjs[i].dispatchEvent(event);
							return;
						}
					}
				}`;

		}

		if (name == "uncheck") {
			script = `
				function(){ 
					var inputObjs = document.querySelectorAll("input[name='${selector}'],input${selector}"); 

					if (inputObjs.length == 1) { 
						inputObjs[0].checked = false;
						var event = new Event('change');
						inputObjs[0].dispatchEvent(event);
						return;
					} 

					if (inputObjs.length == 0) {
						inputObjs = document.querySelectorAll("input[type=radio]"); 
					}

					for (var i = 0; i < inputObjs.length; i++) {
						if (inputObjs[i] && ((inputObjs[i].value == '${selector}') || (inputObjs[i].value == '${value}'))) { 
							inputObjs[i].checked = false;
							var event = new Event('change');
							inputObjs[i].dispatchEvent(event);
							return;
						}
					}
				}`;

		}

		if (name == "text") {
			script = `
				function(){ 

					var pageText = document.querySelectorAll("body")[0].innerText; 
					var inputs = document.querySelectorAll("input,textarea"); 

					var inputText = ""; 
					for (var i = 0; i < inputs.length; i++) {
						inputText += inputs[i].value
					}; 

					return pageText + inputText
				}`;

			if (selector) {
				script = `
					function(){ 
						if (!document.querySelectorAll("${selector}")[0]) {
							return ''; 
						}

						var text = ""; 
						for (var i = 0; i < document.querySelectorAll("${selector}").length; i++) { 
							text += document.querySelectorAll("${selector}")[i].value || document.querySelectorAll("${selector}")[i].innerText
						}; 
						return text;
					}`;
			}
		}

		if (name == "pressButton") {

			if (selector.indexOf(".") === -1 && selector.indexOf("#") === -1) {
				selector = selector.toLowerCase();
				script = `
					function(){ 
						var possibleButtons = document.querySelectorAll("button, input, a.btn"); 
						var buttonToClick; 

						for (var i = 0; i < possibleButtons.length; i++) { 
							if (possibleButtons[i].innerText.toLowerCase().indexOf('${selector}') !== -1) {
								buttonToClick = possibleButtons[i];
								break;
							};
							if (possibleButtons[i].value && possibleButtons[i].value.toLowerCase().indexOf('${selector}') !== -1) {
								buttonToClick = possibleButtons[i];
								break;
							};
						} 

						if(!buttonToClick) { 
							return "No button found for ${selector}"; 
						} 

						buttonToClick.click(); 

						var href = buttonToClick.getAttribute('href'); 
						if (href && href.length > 1) {
							window.location.href = href;
						}
					}`;

			} else {
				script = `
					function(){ 
						var debug; 
						var buttonToClick = document.querySelectorAll("button${selector}, input${selector}, a.btn${selector}")[0]; 

						if (!buttonToClick) {
							buttonToClick = document.querySelectorAll("${selector}")[0];
						}

						buttonToClick.click();

						var href = buttonToClick.getAttribute('href'); 
						if (href && href.length > 1 && href[0] !== '#') {
							window.location.href = href
						}
					}`;
			}
		}

		if (name == "clickLink") {

			const selectorIsIdOrClass = selector.indexOf(".") != -1 || selector.indexOf("#") != -1;

			if (selectorIsIdOrClass) {
				script = `
					function(){ 
						var foundLink = document.querySelectorAll("a${selector}")[0];

						if (!foundLink) {
							foundLink = document.querySelectorAll("${selector}")[0];
						} 

						if (!foundLink) {
							return;
						} 

						foundLink.click(); 
					}`;
			} else {

				const lowerCaseSelector = selector.toLowerCase();
				
				script = `
					function(){ 
						var aTags = document.getElementsByTagName("a"); 

						var foundLink; 
						var foundExactLink;

						for (var i = 0; i < aTags.length; i++) { 
							if (aTags[i].textContent.toLowerCase().indexOf('${lowerCaseSelector}') !== -1) {
								foundLink = aTags[i];
							};

							if (aTags[i].textContent == '${selector}' && aTags[i].textContent.length == '${selector}'.length) {
								foundExactLink = aTags[i];
								break;
							}
						} 

						if (!foundLink) {
							return;
						}

						if (foundExactLink) {
							foundExactLink.click();
						} else {
							foundLink.click();
						}
						
					}`;
			}

		}

		if (name == "pendingjQueryAjax") {

			script = `
				function(){ 

					if (document.readyState !== "complete") {
						return 1;
					}
					
					if (typeof $ == "undefined") {
						return 0;
					}

					return $.active;
				}`;
		}

		resolve(script);
	});
}

module.exports = {
	fetch
};