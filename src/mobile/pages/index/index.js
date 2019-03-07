import './index.scss'
import ready from '@/utils/ready'
if (process.env.NODE_ENV === 'development') {
    require('./index.html')
}
ready(() => {
    console.log(this)
})
