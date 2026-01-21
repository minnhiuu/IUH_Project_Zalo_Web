import { Search, UserPlus, Users, Filter, MoreHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    name: 'CNMOI_HK2_25-26_DHKTP...',
    lastMessage: 'Ton Long Phuoc: Gửi các em link d...',
    time: '2 ngày',
    unread: 0,
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=CNM',
    isGroup: true
  },
  {
    id: 2,
    name: 'Gia đình là số 1',
    lastMessage: 'Xuân Hồ: Hỏng. Siêng thì làm dần dần',
    time: 'Vừa xong',
    unread: 5,
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Family',
    isGroup: true
  },
  {
    id: 3,
    name: 'Ân 2',
    lastMessage: 'Bạn: cam on @thắng lưng lên!!!',
    time: '9 phút',
    unread: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=An',
    isGroup: false
  },
  {
    id: 4,
    name: 'péo',
    lastMessage: 'oke',
    time: '22 phút',
    unread: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peo',
    isGroup: false
  },
  {
    id: 5,
    name: 'Hoàng Huy',
    lastMessage: ':))',
    time: '3 giờ',
    unread: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Huy',
    isGroup: false
  }
]

export default function UserHomePage() {
  return (
    <div className='flex w-full h-full overflow-hidden'>
      <div className='w-[344px] flex flex-col border-r border-border bg-white shrink-0'>
        <div className='p-4 space-y-4'>
          <div className='flex items-center space-x-2'>
            <div className='relative flex-1 group'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
              <Input
                placeholder='Tìm kiếm'
                className='pl-10 h-8 bg-muted border-none focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 text-sm rounded-[4px]'
              />
            </div>
            <button className='p-1.5 hover:bg-muted rounded-full transition-colors'>
              <UserPlus className='w-5 h-5 text-muted-foreground' />
            </button>
            <button className='p-1.5 hover:bg-muted rounded-full transition-colors'>
              <Users className='w-5 h-5 text-muted-foreground' />
            </button>
          </div>

          <div className='flex items-center justify-between text-[13px] font-medium'>
            <div className='flex items-center space-x-4'>
              <button className='text-primary border-b-2 border-primary pb-1'>Tất cả</button>
              <button className='text-muted-foreground hover:text-foreground pb-1'>Chưa đọc</button>
            </div>
            <div className='flex items-center space-x-2 text-muted-foreground'>
              <button className='flex items-center hover:text-foreground'>
                Phân loại <Filter className='w-3 h-3 ml-1 outline-none border-none' />
              </button>
              <button className='hover:text-foreground'>
                <MoreHorizontal className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>

        <div className='mx-4 mb-2 p-3 bg-background rounded-[4px] flex items-start space-x-3 relative group overflow-hidden shrink-0'>
          <div className='p-2 bg-white rounded-md shrink-0 shadow-sm'>
            <div className='w-5 h-5 text-primary border-2 border-primary rounded-sm flex items-center justify-center font-bold text-[10px]'>
              PC
            </div>
          </div>
          <div className='flex-1 pr-2'>
            <p className='text-[12px] leading-tight text-foreground/90'>
              Khi đăng nhập BondHub Web trên nhiều trình duyệt, một số trò chuyện sẽ không đủ tin nhắn cũ.
            </p>
            <button className='text-[12px] text-primary font-medium hover:underline mt-1'>
              Tải BondHub PC để xem đầy đủ tin nhắn
            </button>
          </div>
          <button className='absolute right-1 top-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors'>
            <MoreHorizontal className='w-3 h-3 hover:rotate-90 transition-transform' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto custom-scrollbar shadow-none border-none'>
          {MOCK_CONVERSATIONS.map((chat) => (
            <div
              key={chat.id}
              className='flex items-center px-4 py-3 cursor-pointer hover:bg-muted/50 active:bg-muted transition-colors relative group'
            >
              <div className='relative shrink-0'>
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className='w-12 h-12 rounded-full object-cover border border-black/5'
                />
                <div className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full' />
              </div>
              <div className='ml-3 flex-1 min-w-0 pr-2'>
                <div className='flex items-center justify-between mb-0.5'>
                  <h3 className='text-[15px] font-medium truncate text-foreground/90'>{chat.name}</h3>
                  <span className='text-[11px] text-muted-foreground whitespace-nowrap'>{chat.time}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <p className='text-[13px] text-muted-foreground truncate font-normal'>{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className='bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center'>
                      {chat.unread > 9 ? '9+' : chat.unread}
                    </span>
                  )}
                </div>
              </div>
              <div className='absolute right-4 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center space-x-1'>
                <button className='p-1 hover:bg-white rounded-md shadow-sm'>
                  <MoreHorizontal className='w-4 h-4 text-muted-foreground' />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='flex-1 flex flex-col items-center justify-center bg-secondary p-8 text-center'>
        <div className='max-w-[500px] space-y-8 animate-in fade-in zoom-in duration-700'>
          <div className='space-y-4'>
            <h1 className='text-[22px] font-semibold text-foreground/80'>Chào mừng đến với BondHub Web!</h1>
            <p className='text-[15px] text-muted-foreground leading-relaxed px-8'>
              Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người thân, bạn bè được tối ưu hoá cho máy tính
              của bạn.
            </p>
          </div>

          <div className='relative w-full aspect-video flex items-center justify-center'>
            <div className='relative w-full max-w-[320px]'>
              <img
                src='https://res.cloudinary.com/dt9vunfbg/image/upload/v1711210427/zalo-welcome_yqjs4d.png'
                alt='Welcome Illustration'
                className='w-full h-auto drop-shadow-xl'
                onError={(e) => {
                  e.currentTarget.src =
                    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Welcome&backgroundColor=b6e3f4'
                }}
              />
            </div>
          </div>

          <div className='space-y-4'>
            <h2 className='text-[18px] font-medium text-primary'>Nhắn tin nhiều hơn, soạn thảo ít hơn</h2>
            <p className='text-[14px] text-muted-foreground'>
              Sử dụng <span className='font-bold text-foreground/70'>Tin Nhắn Nhanh</span> để lưu sẵn các tin nhắn
              thường dùng và gửi nhanh trong hội thoại bất kỳ.
            </p>
          </div>

          <div className='flex items-center justify-center space-x-2 pt-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  i === 3 ? 'bg-primary w-4' : 'bg-muted'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
