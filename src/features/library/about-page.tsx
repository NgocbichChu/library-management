export function AboutPage() {
  return (
    <div>
      <section className="border-b border-[#dfe5dc] bg-[#e7eee3] px-5 py-14 lg:px-8 lg:py-20 dark:border-border dark:bg-card/40">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-[0.16em] text-[#c27652] uppercase">
              Về Mộc Miên
            </p>
            <h1 className="mt-4 text-4xl leading-[1.08] font-semibold tracking-tight text-[#1f3b2b] md:text-6xl dark:text-foreground">
              Một nơi để tìm thấy cuốn sách tiếp theo.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#617067] dark:text-muted-foreground">
              Mộc Miên là không gian đọc dành cho những người muốn chậm lại,
              khám phá một ý tưởng mới và tìm thấy niềm vui trong từng trang
              sách. Chúng mình tin rằng hành trình ấy nên bắt đầu thật dễ dàng:
              từ lúc tìm sách đến khi chọn được câu chuyện hợp với mình.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=85"
              alt="Không gian thư viện yên tĩnh với những kệ sách cao"
              className="h-72 w-full object-cover md:h-108"
            />
            <p className="absolute right-3 bottom-3 bg-[#f7f8f4]/95 px-3 py-2 text-xs font-medium text-[#385145] sm:right-5 sm:bottom-5 sm:text-sm">
              Một góc nhỏ dành cho những ý tưởng lớn.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8 lg:py-24">
        <div className="relative order-2 lg:order-1">
          <img
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=85"
            alt="Những cuốn sách được xếp trên kệ trong thư viện"
            className="h-72 w-full object-cover md:h-104"
          />
          <div className="absolute -right-3 -bottom-5 max-w-52 bg-[#c27652] p-5 text-sm leading-6 text-white sm:-right-5 sm:max-w-60">
            Mỗi cuốn sách là một lời mời nhìn thế giới theo cách khác.
          </div>
        </div>
        <div className="order-1 lg:order-2 lg:pl-8">
          <p className="text-sm font-semibold tracking-[0.16em] text-[#c27652] uppercase">
            Đọc theo cách của bạn
          </p>
          <h2 className="mt-3 text-3xl leading-tight font-semibold text-[#1f3b2b] md:text-4xl dark:text-foreground">
            Sách hay nên dễ tìm, và niềm vui đọc nên được sẻ chia.
          </h2>
          <p className="mt-6 leading-7 text-[#617067] dark:text-muted-foreground">
            Từ văn học, khám phá đến kỹ năng sống, kho sách Mộc Miên được sắp
            xếp để bạn có thể dạo quanh theo chủ đề hoặc lần theo một gợi ý bất
            ngờ. Bạn có thể xem thông tin từng đầu sách, kiểm tra tình trạng
            sẵn có và lưu lại những lựa chọn muốn đọc.
          </p>
          <p className="mt-4 leading-7 text-[#617067] dark:text-muted-foreground">
            Dù bạn đang tìm một khoảng lặng cuối ngày, một góc nhìn mới cho
            công việc hay một câu chuyện để đọc cùng người thân, Mộc Miên mong
            rằng bạn sẽ luôn tìm được điều đáng mang về từ trang sách.
          </p>
        </div>
      </section>

      <section className="bg-[#f0ede5] px-5 py-16 lg:px-8 lg:py-20 dark:bg-muted/40">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-[#c27652] uppercase">
              Một thư viện gần gũi
            </p>
            <h2 className="mt-3 text-3xl leading-tight font-semibold text-[#1f3b2b] md:text-4xl dark:text-foreground">
              Từ lần tìm kiếm đầu tiên đến trang cuối cùng.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <article className="border-t border-[#c9c6ba] pt-4 dark:border-border">
              <h3 className="font-semibold text-[#1f3b2b] dark:text-foreground">
                Khám phá
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#617067] dark:text-muted-foreground">
                Tìm sách theo thể loại, tác giả hoặc cảm hứng bạn đang muốn đọc.
              </p>
            </article>
            <article className="border-t border-[#c9c6ba] pt-4 dark:border-border">
              <h3 className="font-semibold text-[#1f3b2b] dark:text-foreground">
                Lựa chọn
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#617067] dark:text-muted-foreground">
                Xem mô tả và tình trạng sách để chọn cuốn phù hợp với mình.
              </p>
            </article>
            <article className="border-t border-[#c9c6ba] pt-4 dark:border-border">
              <h3 className="font-semibold text-[#1f3b2b] dark:text-foreground">
                Kết nối
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#617067] dark:text-muted-foreground">
                Chia sẻ tình yêu đọc sách và tìm thêm những câu chuyện đáng nhớ.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
