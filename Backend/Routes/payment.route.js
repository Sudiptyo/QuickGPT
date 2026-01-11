import { Router } from 'express'
import { getPlans, purchasePlan, verifyPaymentWebhook } from '../Controller/Payment/payment.controller.js'
import { verifyJWT } from '../Middleware/auth.middleware.js'

const router = Router()

router.route('/get-plans').get(getPlans)
router.route('/purchase-plan').post(verifyJWT, purchasePlan)
router.route('/webhook').post(verifyPaymentWebhook)

export default router