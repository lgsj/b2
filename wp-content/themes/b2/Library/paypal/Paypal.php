<?php
//defined('BASEPATH') OR exit('No direct script access allowed');

require __DIR__  . '/Paypal/autoload.php';
/**
 * @author sxc
 * @date 2019/07/04
 */
class Paypal
{
    //配置参数
    private $_apiContext = [];
    
    //支付成功回跳地址
    private $_return_url = '';
    //支付取消回调地址
    private $_cancel_url = '';
    
    /**
     * 初始化接口调用需要的参数
     * @param array $config
     */
    public function init($config){
        $client_id = $config['client_id'];
        $client_secret = $config['client_secret'];
        $this->_cancel_url = $config['cancel_url'];
        $this->_return_url = $config['return_url'];
        $this->_apiContext =  new \PayPal\Rest\ApiContext(
            new \PayPal\Auth\OAuthTokenCredential(
                $client_id,
                $client_secret 
            )
        );
    }
    
    /**
     * 请求paypal的订单创建接口，获取返回的支付地址
     * 
     * @param string $order_id      cocos的订单号
     * @param string $order_name    订单名词
     * @param float $pay_amount     支付金额 
     * @param string $order_desc    订单描述
     */
    public function pagePay($order_id,$order_name,$pay_amount,$order_desc=''){
        $payer = new \PayPal\Api\Payer();
        $payer->setPaymentMethod('paypal');
        
        //金额配置
        $amount = new \PayPal\Api\Amount();
        $amount->setTotal($pay_amount);
        $amount->setCurrency('USD');
        
        //item_list配置
        $item = ['name'=>$order_name,'description'=>$order_name,'quantity' => 1, 'price'=>$pay_amount,'currency' => 'USD'];
        $item_list = new \PayPal\Api\ItemList();
        $item_list->addItem($item);
        
        $transaction = new \PayPal\Api\Transaction();
        $transaction->setAmount($amount);
        $transaction->setCustom($order_id);//透传字段
        $transaction->setDescription($order_desc);//订单描述
        $transaction->setItemList($item_list);
        
        //设置回跳地址和取消跳转地址
        $redirectUrls = new \PayPal\Api\RedirectUrls();
        $redirectUrls->setReturnUrl($this->_return_url)
                     ->setCancelUrl($this->_cancel_url);
        
        $payment = new \PayPal\Api\Payment();
        $payment->setIntent('sale')
                ->setPayer($payer)
                ->setTransactions(array($transaction))
                ->setRedirectUrls($redirectUrls);
        try {
            $payment->create($this->_apiContext);
            return  $payment->getApprovalLink();
        }
        catch (\PayPal\Exception\PayPalConnectionException $ex) {
            // This will print the detailed information on the exception.
            log_message('error', "paypal_pagepay:".var_export(json_encode($ex->getData()),true));
            return false;
        }
                
    }
    
    /**
     * 执行订单
     * https://developer.paypal.com/docs/api/payments/v1/#payment_execute
     * (/v1/payments/payment/{payment_id}/execute)
     * 
     * @param string $payment_id 支付标识id
     * @param string $payer_id 用户支付标识id 
     * 
     * @return NULL|string|boolean
     */
    public function exec($payment_id,$payer_id){
        $paymentExecution = new \PayPal\Api\PaymentExecution();
        $paymentExecution->setPayerId($payer_id);
        
        $payment = new \PayPal\Api\Payment();
        $payment->setId($payment_id);

        try {
            $payment->execute($paymentExecution,$this->_apiContext);

            $transactions = $payment->transactions[0];
            $related_resources = $transactions->related_resources;
            $result = [
                'state'  => $payment->state,
                'payer'  => $payment->payer,
                'custom' => $transactions->custom,//cocos自定义参数
                'amount' => $transactions->amount->total,
                'sale_id' => $related_resources[0]->sale->id,//退款需要使用
                'sale_state' => $related_resources[0]->sale->state
            ];
            return $result;
        }
        catch (\PayPal\Exception\PayPalConnectionException $ex) {
            // This will print the detailed information on the exception.
            log_message('error', "paypal_pagepay:".var_export(json_encode($ex->getData()),true));
            return false;
        }
    }
    
    /**
     * 申请退款
     * https://developer.paypal.com/docs/api/payments/v1/#sale_refund
     * (/v1/payments/sale/{sale_id}/refund)
     * 
     * @param unknown $sale_id
     * @param string $refund_amount
     */
    public function refundApi($sale_id,$refund_amount = ''){
        
        $sale = new \PayPal\Api\Sale();
        $sale->setId($sale_id);

        $refundrequest = new \PayPal\Api\RefundRequest();
        /*
        if($refund_amount){
            $refundrequest->setAmount($refund_amount);
        }
        */
        
        try {
            $refund_detail = $sale->refundSale($refundrequest,$this->_apiContext);
            $refund_id = $refund_detail->id;
            return $refund_id;
        }
        catch (\PayPal\Exception\PayPalConnectionException $ex) {
            // This will print the detailed information on the exception.
            log_message('error', "paypal_refund:".var_export(json_encode($ex->getData()),true));
            return false;
        }
    }
    
}