'use strict'

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
      label: '消費税',
      amount: { currency: 'JPY', value: '0' }
    }],
    shippingOptions: [{
      id: 'standrd',
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

  request.show()
  .then(result => {
    /* どこか支払い処理してくれるAPIにPOSTする */
    return fetch('/pay', {
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
