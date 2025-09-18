#### Authentication Routes

  * **POST** `http://127.0.0.1:5000/auth/register`
  * **POST** `http://127.0.0.1:5000/auth/login`
  * **GET** `http://127.0.0.1:5000/auth/profile`
  * **POST** `http://127.0.0.1:5000/auth/reset-questions`
  * **POST** `http://127.0.0.1:5000/auth/verify-answers`
  * **POST** `http://127.0.0.1:5000/auth/reset-password`

#### Admin Routes

  * **GET** `http://127.0.0.1:5000/admin/users`
  * **GET** `http://127.0.0.1:5000/admin/users/{user_id}`
  * **PATCH** `http://127.0.0.1:5000/admin/users/{user_id}/activate`
  * **PATCH** `http://127.0.0.1:5000/admin/users/{user_id}/deactivate`
  * **POST** `http://127.0.0.1:5000/admin-reset/reset-password`

#### API Routes

##### Products

  * **GET** `http://127.0.0.1:5000/api/products/`
  * **GET** `http://127.0.0.1:5000/api/products/{product_id}`
  * **POST** `http://127.0.0.1:5000/api/products/` (Admin)
  * **PUT** `http://127.0.0.1:5000/api/products/{product_id}` (Admin)
  * **DELETE** `http://127.0.0.1:5000/api/products/{product_id}` (Admin)

##### Categories

  * **GET** `http://127.0.0.1:5000/api/categories/`
  * **GET** `http://127.0.0.1:5000/api/categories/{category_id}`
  * **POST** `http://127.0.0.1:5000/api/categories/` (Admin)
  * **PATCH** `http://127.0.0.1:5000/api/categories/{category_id}` (Admin)
  * **DELETE** `http://127.0.0.1:5000/api/categories/{category_id}` (Admin)

##### Carts

  * **POST** `http://127.0.0.1:5000/api/carts/`
  * **GET** `http://127.0.0.1:5000/api/carts/`
  * **PUT** `http://127.0.0.1:5000/api/carts/{cart_id}`
  * **DELETE** `http://127.0.0.1:5000/api/carts/{cart_id}`
  * **POST** `http://127.0.0.1:5000/api/carts/items`
  * **PUT** `http://127.0.0.1:5000/api/carts/items/{item_id}`
  * **DELETE** `http://127.0.0.1:5000/api/carts/items/{item_id}`

##### Checkout

  * **POST** `http://127.0.0.1:5000/api/checkout/calculate`
  * **POST** `http://127.0.0.1:5000/api/checkout/process`
  * **GET** `http://127.0.0.1:5000/api/checkout/order/{order_id}`

##### Orders

  * **POST** `http://127.0.0.1:5000/api/orders/`
  * **GET** `http://127.0.0.1:5000/api/orders/`
  * **GET** `http://127.0.0.1:5000/api/orders/{order_id}`
  * **PATCH** `http://127.0.0.1:5000/api/orders/{order_id}`
  * **DELETE** `http://127.0.0.1:5000/api/orders/{order_id}`
  * **PUT** `http://127.0.0.1:5000/api/orders/{order_id}/status` (Admin)