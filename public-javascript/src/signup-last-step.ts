/*
	robotoskunk.com - The whole main website of RobotoSkunk.
	Copyright (C) 2023 Edgar Alexis Lima <contact@robotoskunk.com>

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


(async () =>
{
	const apiForm = new RSApiForm();

	apiForm.showSection(0);
	await apiForm.show();

	function setErrorMessage(message: string): void
	{
		d.querySelectorAll('.error').forEach(e => e.textContent = message);
	}

	// #region Password strength
	function passwordMatch(): boolean
	{
		const passwordInput = d.querySelector('#password') as HTMLInputElement;
		const passwordRepeatInput = d.querySelector('#password-repeat') as HTMLInputElement;

		const match = passwordInput.value === passwordRepeatInput.value;
		setErrorMessage(match ? '' : 'Passwords do not match.');

		return match;
	}

	async function checkPassword(password: string)
	{
		const data = await zxcvbn(password);
		const colors = ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3'];

		d.querySelector('#password-strength').innerHTML = data.scoreText;
		(d.querySelector('#password-bar') as HTMLDivElement).style.width = `${data.score / 4 * 100}%`;
		(d.querySelector('#password-bar') as HTMLDivElement).style.backgroundColor = colors[data.score];
		d.querySelector('#handler-alert').className = data.score <= 1 ? 'handler-at danger' : (data.score == 2 ? 'handler-at warning' : 'handler-at');

		d.querySelector('#warning').textContent = data.feedback.warning;
		d.querySelector('#suggestions').innerHTML = '';

		for (const s of data.feedback.suggestions)
			d.querySelector('#suggestions').appendChild(d.createElement('li')).textContent = s;

		(d.querySelector('#s2-btn') as HTMLButtonElement).disabled = data.score <= 2 || !passwordMatch();
	}

	await checkPassword((d.querySelector('#password') as HTMLInputElement).value);



	d.querySelector('#password').addEventListener('input', async (ev) =>
	{
		await checkPassword((ev.target as HTMLInputElement).value);
	});


	d.querySelector('#password-repeat').addEventListener('input', (_) =>
	{
		(d.querySelector('#s2-btn') as HTMLInputElement).disabled = !passwordMatch();
	});
	// #endregion


	d.querySelector('a#toggle-password').addEventListener('click', (ev) =>
	{
		ev.preventDefault();
		ev.stopPropagation();

		const input = d.querySelectorAll('input[data-type="password"]') as NodeListOf<HTMLInputElement>;

		for (const i of input as unknown as HTMLInputElement[]) {
			const style = window.getComputedStyle(i);

			if (style.display !== 'none') {
				i.type = i.type === 'password' ? 'text' : 'password';
				d.querySelector('a#toggle-password').innerHTML = `<img width="25" src="/resources/svg/eye-${
																	i.type === 'password' ? 'enable' : 'disable'
																}.svg" alt="Show password">`;
			}
		}
	});


	const buttons = d.querySelectorAll('button.submit') as NodeListOf<HTMLButtonElement>;


	apiForm.form.addEventListener('submit', async (ev) =>
	{
		if (!apiForm.form.checkValidity()) {
			return apiForm.form.reportValidity();
		}

		ev.preventDefault();
		ev.stopPropagation();


		buttons.forEach(s => s.disabled = true);
		buttons.forEach(s => s.innerHTML = '<span class="loader black"></span>');

		const data = new FormData(apiForm.form);

		const date = new Date(data.get('birthdate').toString());
		data.delete('birthdate');
		data.append('birthdate', date.getTime().toString());


		if (data.get('password') === '') {
			await apiForm.hide();
			apiForm.showSection(1);

		} else if (!data.get('h-captcha-response')) {
			await apiForm.hide();
			apiForm.showSection(2);

		} else {
			try {
				const response = await fetch('/accounts/signup', {
					'method': 'POST',
					'body': new URLSearchParams(data as any)
				});
				
				await apiForm.hide();


				if (response.status === 429) {
					setErrorMessage('You have been rate limited. Please try again later.');
					apiForm.showSection(0);
				
				} else if (response.status >= 400) {
					const json = await response.json();
					setErrorMessage(json.message);

					switch (json.code) {
						case 4: apiForm.showSection(1); break;
						case 5: apiForm.showSection(2); break;
						default: apiForm.showSection(0); break;
					}

					hcaptcha.reset();
				} else apiForm.showSection(3);
			} catch(e) {
				console.error(e);
				setErrorMessage('An error occurred while trying to sign up.');
				apiForm.showSection(0);
			}
		}

		await apiForm.show();

		buttons.forEach(s => s.disabled = false);
		buttons.forEach(s => s.innerHTML = 'Continue');
	});
})();