Dockerを使ってPHPとSeleniumの環境を構築するには、以下の手順を実行します。これにより、コンテナ内でPHPスクリプトを実行し、Seleniumサーバーを使ってブラウザを操作することができます。

### ステップ1: Docker Composeファイルの作成

Docker Composeを使って複数のコンテナを管理します。以下の`docker-compose.yml`ファイルを作成します。

```yaml
version: '3'
services:
  php:
    image: php:7.4-cli
    volumes:
      - .:/app
    working_dir: /app
    networks:
      - selenium_network
    depends_on:
      - selenium
    command: bash -c "composer install && php script.php"

  selenium:
    image: selenium/standalone-chrome
    networks:
      - selenium_network

  composer:
    image: composer:latest
    volumes:
      - .:/app
    working_dir: /app
    command: install

networks:
  selenium_network:
    driver: bridge
```

### ステップ2: Composer設定とPHPスクリプトの作成

1. **`composer.json`ファイルの作成**

   ```json
   {
     "require": {
       "php-webdriver/webdriver": "^1.8"
     }
   }
   ```

2. **PHPスクリプトの作成**

   `script.php`という名前のファイルを作成し、以下のコードを追加します。

   ```php
   <?php

   require 'vendor/autoload.php';

   use Facebook\WebDriver\Remote\RemoteWebDriver;
   use Facebook\WebDriver\Remote\DesiredCapabilities;
   use Facebook\WebDriver\WebDriverBy;

   // Selenium ServerのURL
   $host = 'http://selenium:4444/wd/hub'; // Dockerコンテナ名を使用
   $driver = RemoteWebDriver::create($host, DesiredCapabilities::chrome());

   // 指定されたURLを開く
   $url = 'https://example.com';
   $driver->get($url);

   // ページの高さを取得
   $lastHeight = $driver->executeScript("return document.body.scrollHeight");

   while (true) {
       // ページをスクロールダウン
       $driver->executeScript("window.scrollTo(0, document.body.scrollHeight);");
       sleep(3); // 少し待機

       // 新しいページの高さを取得
       $newHeight = $driver->executeScript("return document.body.scrollHeight");

       if ($newHeight == $lastHeight) {
           break;
       }
       $lastHeight = $newHeight;
   }

   // 特定のIDで始まる要素を確認
   $elements = $driver->findElements(WebDriverBy::cssSelector('[id^="aaprimead-reading-aggregate"]'));

   if (count($elements) > 0) {
       echo "新しい要素が" . count($elements) . "個追加されました\n";
   } else {
       echo "新しい要素は追加されていません\n";
   }

   // ブラウザを閉じる
   $driver->quit();
   ```

### ステップ3: Dockerコンテナの起動

ターミナルでプロジェクトのディレクトリに移動し、以下のコマンドを実行してDockerコンテナを起動します。

```sh
docker-compose up --build
```

これにより、以下のことが実行されます：

1. PHPコンテナが作成され、`composer install`コマンドが実行されます。
2. Seleniumコンテナが作成され、スタンドアロンのChromeブラウザが起動します。
3. PHPコンテナが`script.php`を実行し、Seleniumコンテナを介してブラウザ操作が行われます。

### ステップ4: 結果の確認

`docker-compose up`コマンドの出力を確認することで、スクリプトの実行結果が表示されます。特定のIDで始まる要素がページに追加されているかどうかが確認できます。

### まとめ

この手順に従うことで、Dockerを使用してPHPとSeleniumの環境を構築し、PHPスクリプトを実行してブラウザを自動化することができます。これにより、環境の依存関係を最小限に抑え、容易に再現可能なテスト環境を整えることができます。