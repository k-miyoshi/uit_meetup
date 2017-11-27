function clickPayment() {

  /* PaymentRequestAPI に対応しているかどうか */
  if (!window.PaymentRequest) {
    return window.alert('PaymentRequestに対応していません')
  }

  /* 支払い方法 */
  const methodData = [{
    supportedMethods: ['basic-card'],
    data: {
      supportedNetworks: ['visa', 'mastercard', 'amex', 'discover','diners', 'jcb', 'unionpay']
    }
  }]

  /* 支払い詳細 */
  const detailParams = {
    displayItems: [{
      label: '本体価格',
      amount: { currency: 'JPY', value: '12800' }
    }, {
      label: '配送料',
      amount: { currency: 'JPY', value: '0' }
    }],
    shippingOptions: [{
      id: 'standard',
      label: '通常配送',
      amount: { currency: 'JPY', value: '0' },
      selected: true
    },{
      id: 'express',
      label: '特急配送',
      amount: { currency: 'JPY', value: '500' }
    }],
    total: {
      label: '合計価格',
      amount: { currency: 'JPY', value : '12800' }
    }
  }

  /* 支払いオプション */
  const options = {
    requestShipping: true,
    shippingType: 'delivery'
  }

  const request = new PaymentRequest(methodData, detailParams, options)

  /* 住所変更の地道な処理 */
  request.addEventListener('shippingaddresschange', e => {
    e.updateWith(((detailParams) => {
      /* 自力でPromiseを解決しておかないとUIが死ぬ */
      return Promise.resolve(detailParams)
    })(detailParams))
  })

  /* 配送料変更の地道な処理 */
  request.addEventListener('shippingoptionchange', e => {
    e.updateWith(((detailParams, shippingOption) => {
      if (shippingOption==='standard') {
        /* なんでここの処理が人力なのか謎 */
        detailParams.shippingOptions[0].selected = true
        detailParams.shippingOptions[1].selected = false
        detailParams.displayItems[1].amount.value = '0'

        detailParams.total.amount.value = '12800'
      } else {
        detailParams.shippingOptions[0].selected = false
        detailParams.shippingOptions[1].selected = true
        detailParams.displayItems[1].amount.value = '500'

        detailParams.total.amount.value = '13200'
      }
      return Promise.resolve(detailParams)
    })(detailParams, request.shippingOption))
  })

  request.show()
  .then(result => {
    /* どこか支払い処理してくれるAPIにPOSTする */
    return fetch('/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result.toJSON())
    }).then(response => {
      if (response.status === 200) {
        /* 支払い成功 */
        return result.complete('success')
      } else {
        /* 支払い失敗 */
        return result.complete('fail')
      }
    }).catch(() => {
      /* 支払い失敗 */
      return result.complete('fail')
    })
  })
}
document.querySelector('.paymentBtn').addEventListener('click', clickPayment)
