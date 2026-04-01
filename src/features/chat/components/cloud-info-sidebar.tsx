import { Cloud, Info, Clock, Image as ImageIcon, FileText, Link as LinkIcon, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function CloudInfoSidebar() {
  return (
    <div className='w-[340px] border-l border-border bg-background hidden lg:flex flex-col h-full overflow-y-auto custom-scrollbar shrink-0'>
      <div className='flex items-center justify-center border-b border-border h-[68px] shrink-0 font-medium pb-2 text-foreground/90'>
        Thông tin hội thoại
      </div>

      <div className='p-6 flex flex-col items-center border-b border-border'>
        <div className='w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm mb-3'>
          <Cloud className='w-8 h-8' />
        </div>
        <h3 className='font-semibold text-lg text-foreground/90'>My Documents</h3>
        <p className='text-sm text-center text-muted-foreground mt-2 px-4'>
          Lưu trữ và truy cập nhanh những nội dung quan trọng của bạn ngay trên Zalo
        </p>

        <div className='w-full mt-6'>
          <div className='flex justify-between items-center mb-1'>
            <span className='text-xs font-medium text-foreground/80'>Dung lượng</span>
            <span className='text-xs text-muted-foreground'>249 MB / 500 MB</span>
          </div>

          <div className='h-2 bg-muted rounded-full overflow-hidden flex w-full mb-2'>
            <div className='bg-orange-400 w-[20%]' />
            <div className='bg-green-500 w-[15%]' />
            <div className='bg-blue-400 w-[10%]' />
            <div className='bg-zinc-300 w-[55%]' />
          </div>

          <div className='flex items-center space-x-3 text-[10px] text-muted-foreground mb-4 justify-center'>
            <div className='flex items-center'>
              <div className='w-1.5 h-1.5 rounded-full bg-orange-400 mr-1' /> Ảnh
            </div>
            <div className='flex items-center'>
              <div className='w-1.5 h-1.5 rounded-full bg-green-500 mr-1' /> Video
            </div>
            <div className='flex items-center'>
              <div className='w-1.5 h-1.5 rounded-full bg-blue-400 mr-1' /> File
            </div>
            <div className='flex items-center'>
              <div className='w-1.5 h-1.5 rounded-full bg-zinc-300 mr-1' /> Khác
            </div>
          </div>

          <Button
            variant='secondary'
            className='w-full bg-secondary/60 hover:bg-secondary border shadow-none font-medium text-sm text-foreground/80 mb-4'
          >
            Xem và dọn dẹp My Documents
          </Button>

          <Card className='p-3 bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40 shadow-none rounded-lg'>
            <div className='flex items-start space-x-2'>
              <Info className='w-4 h-4 text-blue-500 mt-0.5 shrink-0' />
              <div>
                <p className='text-[13px] font-medium text-foreground/80'>Nâng cấp dung lượng My Documents</p>
                <p className='text-[12px] text-muted-foreground mt-1 mb-2'>
                  Mở rộng dung lượng lên đến 100GB và tự động bảo toàn dữ liệu trò chuyện với zCloud.
                </p>
                <div className='text-[13px] font-semibold text-blue-600 cursor-pointer hover:underline'>
                  Thêm dung lượng
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className='flex-1'>
        {/* Accordions Mockup */}
        <div className='flex items-center justify-between p-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border transition-colors'>
          <div className='flex items-center text-sm font-medium'>
            <Clock className='w-4 h-4 mr-3 text-muted-foreground' />
            Danh sách nhắc hẹn
          </div>
          <ChevronRight className='w-4 h-4 text-muted-foreground' />
        </div>

        <div className='flex items-center justify-between p-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border transition-colors'>
          <div className='flex items-center text-sm font-medium'>
            <ImageIcon className='w-4 h-4 mr-3 text-muted-foreground' />
            Ảnh/Video
          </div>
          <ChevronRight className='w-4 h-4 text-muted-foreground' />
        </div>

        <div className='flex items-center justify-between p-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border transition-colors'>
          <div className='flex items-center text-sm font-medium'>
            <FileText className='w-4 h-4 mr-3 text-muted-foreground' />
            File
          </div>
          <ChevronRight className='w-4 h-4 text-muted-foreground' />
        </div>

        <div className='flex items-center justify-between p-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border transition-colors'>
          <div className='flex items-center text-sm font-medium'>
            <LinkIcon className='w-4 h-4 mr-3 text-muted-foreground' />
            Link
          </div>
          <ChevronRight className='w-4 h-4 text-muted-foreground' />
        </div>
      </div>
    </div>
  )
}
