import { Component, Vue } from 'vue-property-decorator'
import { ElUploadProgressEvent } from 'element-ui/types/upload'
import {
  DownloadParam,
  downLoadPdfApi,
  formatFetchUrl,
  OnDownloadProgress,
} from './utils'

@Component({
  name: 'DownloadMixins',
})
export default class extends Vue {
  [x: string]: any

  public async onSyncDownload() {
    this.isLoading = true
    try {
      // 验证token是否有效
      const validToken = true // 根据自己的项目验证token是否过期
      if (validToken) {
        this.$notify.success({
          title: '提交成功',
          message: '报告提交成功，正在下载文件，请稍等...',
          type: 'success',
          duration: 5000,
          iconClass: 'notify-icon-style',
        })
        this.onDownLoad()
      } else {
        this.downloadStatus = 4
        this.hideDialog()
      }
    } catch (err) {
      this.downloadStatus = 4
      this.hideDialog()
    }
  }

  async onDownLoad() {
    this.showDialog()
    const originUrl = window.location.origin
    const params: DownloadParam = {
      pageRouter: '/syncPage?isServer=true',
      originUrl,
    }
    const downloadFileName = `同步下载报告~${new Date().toLocaleString()}.pdf`
    console.log('formatFetchUrl ===>', formatFetchUrl(originUrl, params))
    try {
      const res = await downLoadPdfApi(
        params,
        this.onDownloadProgress as OnDownloadProgress,
      )
      console.log('res', res)
      if (
        res.data &&
        Object.prototype.toString.call(res.data) === '[object Blob]'
      ) {
        this.downloadStatus = 3
        this.$notify.success({
          title: '下载成功',
          message: downloadFileName + '下载成功',
          duration: 6000,
          iconClass: 'notify-icon-style',
        })
        this.downloadPdf(res.data, downloadFileName)
        this.active = 3
        this.hideDialog(true)
      } else {
        this.downloadStatus = 4
        this.$notify.error({
          title: '下载失败',
          message: downloadFileName + '下载失败',
          duration: 6000,
          iconClass: 'notify-icon-style',
        })
        this.hideDialog()
      }
    } catch (e) {
      this.downloadStatus = 4
      console.log('download res', e)
      this.$notify.error({
        title: '下载失败',
        message: '下载失败' + e,
        duration: 6000,
        iconClass: 'notify-icon-style',
      })
      this.hideDialog()
    }
  }

  onDownloadProgress(progressEvent: ElUploadProgressEvent) {
    if (progressEvent) {
      const { total, loaded } = progressEvent
      if (total <= 0) return
      if (this.active !== 2) {
        this.active = 2
      }
      const t = Number(String(Math.floor((loaded / total) * 100)).split('.')[0])
      this.percentage = t
    }
  }

  downloadPdf(blobData: Blob, downloadFileName: string) {
    const link = document.createElement('a')
    const url = window.URL.createObjectURL(
      new Blob([blobData], { type: 'application/pdf,charset=utf-8' }),
    )
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', downloadFileName)
    document.body.appendChild(link)
    link.click()
  }

  showDialog() {
    this.isLoading = true
    this.percentage = 0
    this.active = 1
    this.show = 1
  }

  hideDialog(bool?: boolean) {
    this.isLoading = false
    if (bool) {
      setTimeout(() => {
        this.show = 2
      }, 2500)
    } else {
      this.show = 0
    }
    setTimeout(() => {
      this.percentage = 0
    }, 4000)
  }
}
