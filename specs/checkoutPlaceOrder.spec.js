const { test, expect, logout, login } = require("@wordpress/e2e-test-utils-playwright");

const { addNewProduct } = require("../utils/e2eUtils/createProductUtils");

const {addPricingInventory} = require('../utils/e2eUtils/productInventoryUtils');

const {generateTestCode} = require('../utils/e2eUtils/randomTestCode');

const {removeTestProductRecord} = require('../utils/e2eUtils/testProductDeletion');

const {removeTestUserRecord} = require('../utils/e2eUtils/testUserDeletion');

const { addCustomerUser } = require('../utils/e2eUtils/createCustomerUtils');

const {customerUserLogin} = require('../utils/e2eUtils/customerLoginUtils');

const {checkoutPlaceOrder} = require('../utils/e2eUtils/checkoutPlaceOrderUtils');

const {adminLogin} = require('../utils/e2eUtils/adminLoginUtils');

const { consumers } = require("stream");

require("dotenv").config();

test.describe('Test should verify the chekcout workflow', ()=>{

	let testCode = 0;
	let productTitle = '';
	let productDescription = '';

	let userName = '';
	let userEmail = '';
	let firstName = '';
	let lastName = '';
	let password = '';

	let customerUserId = 0;

	test.beforeEach( async ({admin,  page, requestUtils})=>{

		testCode = generateTestCode();

		productTitle = `Product Demo Title ${testCode}`;
		productDescription = `Demo Product Description ${testCode}`;

		await addNewProduct(admin, page, productTitle, productDescription);

		await addPricingInventory(admin, page);

		userName = `TestUserName-${testCode}`;
		userEmail = `test${testCode}@trial.com`;
		firstName = `TestFirstName-${testCode}`;
		lastName = `TestLastName-${testCode}`;
		password = `TestPassword${testCode}*`;

		// await addCustomerUser(admin, page, userName, userEmail, firstName, lastName, password);

		const customerUserData = await requestUtils.createUser({
			username: userName,
			email: userEmail,
			first_name: firstName,
			last_name: lastName,
			password,
			roles: ['customer']
		});

		customerUserId = customerUserData.id

		console.log(customerUserId);

		await page.goto(`${process.env.WP_BASE_URL}wp-login.php?action=logout`);

		const logoutLink = page.locator('//div[contains(@class,"wp-die-message")]//p[2]//a');
		await logoutLink.click();
		

	});

	test('It should be add product to cart, checkout and place order',async({admin, page})=>{
		
		await customerUserLogin(page, userName, password);

		await checkoutPlaceOrder(page, firstName, lastName, productTitle)

		await expect(page).toHaveTitle('Order Confirmation');
		
	});

	test.afterEach(async ({admin, page, requestUtils})=>{

		await requestUtils.deleteAllUsers();

		// await requestUtils.login({
		// 	username: process.env.WP_USERNAME,
		// 	password: process.env.WP_PASSWORD
		// });

		await adminLogin(page);

		await removeTestProductRecord(admin, page, productTitle);

		// await removeTestUserRecord(admin, page, userName);
	
	})
})
