(async () => {
	const sections = [];

	for (const section of d.querySelectorAll('.section'))
		sections.push(new RSApiFormSection(section, Number.parseInt(section.getAttribute('data-height'))));


	const form = d.querySelector('form');
	const f = new RSApiForm(form, sections);


	f.showSection(0);
	await f.show();

	function setError(msg) {
		d.querySelectorAll('.error').forEach(e => e.textContent = msg);
	}

	// #region Password strength
	function pwrdMatch() {
		const match = d.querySelector('#password').value === d.querySelector('#password-repeat').value;
		setError(match ? '' : 'Passwords do not match.');

		return match;
	}

	async function checkPwrd(password) {
		const data = await zxcvbn(password);
		const colors = ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3'];

		d.querySelector('#password-strength').innerHTML = data.scoreText;
		d.querySelector('#password-bar').style.width = `${data.score / 4 * 100}%`;
		d.querySelector('#password-bar').style.backgroundColor = colors[data.score];
		d.querySelector('#handler-alert').className = data.score <= 1 ? 'handler-at danger' : (data.score == 2 ? 'handler-at warning' : 'handler-at');

		d.querySelector('#warning').textContent = data.feedback.warning;
		d.querySelector('#suggestions').innerHTML = '';

		for (const s of data.feedback.suggestions)
			d.querySelector('#suggestions').appendChild(d.createElement('li')).textContent = s;

		d.querySelector('#s2-btn').disabled = data.score <= 2 || !pwrdMatch();
	}
	await checkPwrd(d.querySelector('#password').value);


	d.querySelector('#password').addEventListener('input', async (ev) => { await checkPwrd(ev.target.value); });
	d.querySelector('#password-repeat').addEventListener('input', (ev) => { d.querySelector('#s2-btn').disabled = !pwrdMatch(); });
	// #endregion


	d.querySelector('a#toggle-password').addEventListener('click', (ev) => {
		ev.preventDefault();
		ev.stopPropagation();

		/**
		 * @type {HTMLInputElement[]}
		 */
		const input = d.querySelectorAll('input[data-type="password"]');

		for (const i of input) {
			const style = window.getComputedStyle(i);

			if (style.display !== 'none') {
				i.type = i.type === 'password' ? 'text' : 'password';
				d.querySelector('a#toggle-password').innerHTML = `<img width="25" src="/resources/svg/eye-${i.type === 'password' ? 'enable' : 'disable'}.svg" alt="Show password">`;
			}
		}
	});


	const buttons = d.querySelectorAll('button.submit');


	form.addEventListener('submit', async (ev) => {
		if (!form.checkValidity())
			return form.reportValidity();

		ev.preventDefault();
		ev.stopPropagation();


		buttons.forEach(s => s.disabled = true);
		buttons.forEach(s => s.innerHTML = '<span class="loader black"></span>');

		const data = new FormData(form);

		const date = new Date(data.get('birthdate'));
		data.delete('birthdate');
		data.append('birthdate', date.getTime());


		if (data.get('password') === '') {
			await f.hide();
			f.showSection(1);

		} else if (!data.get('h-captcha-response')) {
			await f.hide();
			f.showSection(2);

		} else {
			try {
				const response = await fetch('/accounts/signup', {
					'method': 'POST',
					'body': new URLSearchParams(data)
				});
				
				await f.hide();


				if (response.status === 429) {
					setError('You have been rate limited. Please try again later.');
					f.showSection(0);
				
				} else if (response.status >= 400) {
					const json = await response.json();
					setError(json.message);

					switch (json.code) {
						case 4: f.showSection(1); break;
						case 5: f.showSection(2); break;
						default: f.showSection(0); break;
					}

					hcaptcha.reset();
				} else f.showSection(3);
			} catch(e) {
				console.error(e);
				setError('An error occurred while trying to sign up.');
				f.showSection(0);
			}
		}

		await f.show();

		buttons.forEach(s => s.disabled = false);
		buttons.forEach(s => s.innerHTML = 'Continue');
	});
})();
