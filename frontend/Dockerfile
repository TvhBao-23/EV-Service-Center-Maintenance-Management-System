# === Stage 1: Build React App ===
# Sử dụng Node.js LTS phiên bản Alpine (nhỏ gọn)
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json và package-lock.json (hoặc yarn.lock)
COPY package*.json ./
# Nếu dùng yarn: COPY yarn.lock ./

# Cài đặt dependencies dùng clean install (nhanh và nhất quán hơn)
RUN npm ci
# Nếu dùng yarn: RUN yarn install --frozen-lockfile

# Copy toàn bộ source code của frontend
COPY . .

# Build ứng dụng React (sử dụng biến môi trường nếu cần)
# Ví dụ: ARG REACT_APP_API_URL
# ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# === Stage 2: Serve with Nginx ===
# Sử dụng image Nginx Alpine chính thức (rất nhỏ)
FROM nginx:stable-alpine

# Xóa config mặc định của Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy file cấu hình Nginx tùy chỉnh (nginx.conf) vào đúng vị trí
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Lưu ý: Tên file config trong container thường là default.conf hoặc site.conf

# Copy kết quả build từ stage 'build' vào thư mục phục vụ web của Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Hoặc /app/build nếu create-react-app

# Expose cổng 80 (cổng mặc định của Nginx)
EXPOSE 80
# Docker Compose sẽ map cổng này ra bên ngoài (ví dụ 3000 -> 80)

# Lệnh mặc định để chạy Nginx ở foreground
CMD ["nginx", "-g", "daemon off;"]