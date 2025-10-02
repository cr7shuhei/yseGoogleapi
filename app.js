// JavaScript: 機能の実装
const getLocationBtn = document.getElementById('getLocationBtn');
const latitudeElem = document.getElementById('latitude');
const longitudeElem = document.getElementById('longitude');
const cityElem = document.getElementById('city');
const townElem = document.getElementById('town');
const errorMessageElem = document.getElementById('error-message');

// ボタンがクリックされたときの処理
getLocationBtn.addEventListener('click', () => {
    // 各表示をリセット
    latitudeElem.textContent = '取得中...';
    longitudeElem.textContent = '取得中...';
    cityElem.textContent = '-';
    townElem.textContent = '-';
    errorMessageElem.style.display = 'none';

    // Geolocation APIが使用可能かチェック
    if (!navigator.geolocation) {
        showError('お使いのブラウザは位置情報取得に対応していません。');
        return;
    }

    // 現在位置を取得
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
});

// 位置情報取得成功時のコールバック関数
const successCallback = (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // 画面に緯度・経度を表示
    latitudeElem.textContent = latitude.toFixed(6); // 小数点以下6桁に丸める
    longitudeElem.textContent = longitude.toFixed(6);

    // 緯度経度から住所情報を取得
    getAddressFromCoords(latitude, longitude);
};

// 位置情報取得失敗時のコールバック関数
const errorCallback = (error) => {
    let message = '';
    switch (error.code) {
        case 1: // PERMISSION_DENIED
            message = '位置情報の利用が許可されていません。';
            break;
        case 2: // POSITION_UNAVAILABLE
            message = '現在位置を特定できませんでした。';
            break;
        case 3: // TIMEOUT
            message = '位置情報の取得がタイムアウトしました。';
            break;
        default:
            message = '位置情報の取得中にエラーが発生しました。';
            break;
    }
    showError(message);
};

// 緯度経度から住所を取得する関数
const getAddressFromCoords = async (lat, lng) => {
    // =================================================================
    // 重要：以下の 'YOUR_API_KEY' をご自身のAPIキーに置き換えてください
    // =================================================================
    const apiKey = 'AIzaSyCj8tPRJq23V2-f6SP3LIBNB02Aim8Mi-g';
    
    if (apiKey === 'YOUR_API_KEY') {
        showError('Google Maps APIキーが設定されていません。');
        cityElem.textContent = '設定エラー';
        townElem.textContent = '設定エラー';
        return;
    }
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ja`;
    cityElem.textContent = '取得中...';
    townElem.textContent = '取得中...';

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
            const addressComponents = data.results[0].address_components;
            
            // 市町村名と大字名を抽出
            const city = findAddressComponent(addressComponents, 'locality');
            const town = findAddressComponent(addressComponents, 'sublocality_level_1') || 
                         findAddressComponent(addressComponents, 'sublocality_level_2') || 
                         '';

            cityElem.textContent = city || '取得不可';
            townElem.textContent = town || '取得不可';

        } else {
             showError(`住所の取得に失敗しました: ${data.status}`);
             cityElem.textContent = '取得失敗';
             townElem.textContent = '取得失敗';
        }
    } catch (error) {
        console.error('APIリクエストエラー:', error);
        showError('APIへのリクエスト中にエラーが発生しました。');
        cityElem.textContent = '取得失敗';
        townElem.textContent = '取得失敗';
    }
};

// 住所コンポーネント配列から指定されたタイプの値を見つけるヘルパー関数
const findAddressComponent = (components, type) => {
    const component = components.find(c => c.types.includes(type));
    return component ? component.long_name : null;
};

// エラーメッセージを表示する関数
const showError = (message) => {
    latitudeElem.textContent = '-';
    longitudeElem.textContent = '-';
    errorMessageElem.textContent = message;
    errorMessageElem.style.display = 'block';
};