'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Search, Star, Clock, MapPin, Filter, Heart, ChevronDown, Sparkles, TrendingUp, Award, Shield, Zap, Calendar, CheckCircle, X, Car, Briefcase } from 'lucide-react';

const servicesData = [
  // Cleaning Services
  { id: 1, name: 'Deep House Cleaning', category: 'deep-clean', price: 1200, duration: '3-4 hours', rating: 4.8, reviews: 1247, image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&h=300&fit=crop', description: 'Complete deep cleaning of your entire house including bathrooms, kitchen, and all rooms', popular: true },
  { id: 2, name: 'Regular House Cleaning', category: 'cleaning', price: 800, duration: '2-3 hours', rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&h=300&fit=crop', description: 'Regular maintenance cleaning for your home on weekly or monthly basis', popular: true },
  { id: 3, name: 'Bathroom Deep Clean', category: 'bathroom', price: 400, duration: '1-2 hours', rating: 4.7, reviews: 634, image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=300&fit=crop', description: 'Specialized bathroom cleaning with sanitization and deep scrubbing' },
  { id: 4, name: 'Kitchen Deep Clean', category: 'kitchen', price: 600, duration: '2-3 hours', rating: 4.5, reviews: 445, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', description: 'Complete kitchen cleaning including appliances, cabinets, and countertops' },
  
  // Laundry Services
  { id: 5, name: 'Laundry & Ironing', category: 'laundry', price: 300, duration: '2-4 hours', rating: 4.4, reviews: 321, image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&h=300&fit=crop', description: 'Professional laundry service with washing, drying, and ironing' },
  { id: 6, name: 'Dry Cleaning Service', category: 'laundry', price: 450, duration: '1 day', rating: 4.5, reviews: 278, image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop', description: 'Professional dry cleaning for delicate and formal wear' },
  
  // Carpet & Window Services
  { id: 7, name: 'Carpet Cleaning', category: 'carpet', price: 500, duration: '1-2 hours', rating: 4.6, reviews: 278, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', description: 'Deep carpet cleaning with stain removal and sanitization' },
  { id: 8, name: 'Sofa & Upholstery Clean', category: 'carpet', price: 650, duration: '2-3 hours', rating: 4.7, reviews: 312, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop', description: 'Professional sofa and upholstery deep cleaning service' },
  { id: 9, name: 'Window Cleaning', category: 'window', price: 350, duration: '1-2 hours', rating: 4.3, reviews: 189, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', description: 'Interior and exterior window cleaning for crystal clear views' },
  
  // Specialty Services
  { id: 10, name: 'Move-in/Move-out Cleaning', category: 'move', price: 1500, duration: '4-6 hours', rating: 4.9, reviews: 567, image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop', description: 'Comprehensive cleaning for moving in or out of a property' },
  { id: 11, name: 'Office Cleaning', category: 'specialty', price: 900, duration: '2-4 hours', rating: 4.6, reviews: 423, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop', description: 'Professional office and commercial space cleaning services' },
  { id: 12, name: 'Post-Construction Cleaning', category: 'specialty', price: 1800, duration: '5-7 hours', rating: 4.8, reviews: 289, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', description: 'Detailed cleaning after construction or renovation work' },
  { id: 13, name: 'Balcony Cleaning', category: 'specialty', price: 250, duration: '1 hour', rating: 4.4, reviews: 156, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop', description: 'Complete balcony and terrace cleaning service' },
  { id: 14, name: 'Chimney & Exhaust Cleaning', category: 'kitchen', price: 550, duration: '1-2 hours', rating: 4.5, reviews: 234, image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop', description: 'Deep cleaning of kitchen chimneys and exhaust systems' },
  { id: 15, name: 'Water Tank Cleaning', category: 'specialty', price: 800, duration: '2-3 hours', rating: 4.7, reviews: 198, image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', description: 'Professional water tank cleaning and sanitization' },

  // Pujari Services (Partners available)
  { id: 16, name: 'Ganesh Puja at Home', category: 'pujari', price: 2100, duration: '2-3 hours', rating: 4.9, reviews: 432, image: 'https://cdn.shopify.com/s/files/1/2090/3151/files/MPB6116_a2e0c5a8-7c1a-4755-ae54-1b2cc7eaeab2_480x480.jpg?v=1715581380', description: 'Traditional Ganesh puja conducted by experienced pujari with all rituals and samagri included', noPartner: true },
  { id: 17, name: 'Griha Pravesh Puja', category: 'pujari', price: 3500, duration: '3-4 hours', rating: 4.8, reviews: 287, image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEhUSExMWFRUXFxgXFRgVGBcYGhUVGBcXFxcVFRgYHSggGBolHRUXITEhJSktLi4uFx8zODMtNygtLi0BCgoKDg0OGxAQGy0mICUtLS0tLSstLy0tLS0vLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAK4BIgMBIgACEQEDEQH/xAAcAAACAwEBAQEAAAAAAAAAAAAEBQIDBgEABwj/xAA8EAABAwMCBAQEAwYFBQEAAAABAAIRAwQhEjEFQVFhEyJxkQaBobEyQsEUI1Ji0fAVcqLh8QcWM4KSU//EABoBAAMBAQEBAAAAAAAAAAAAAAMEBQIBAAb/xAAuEQACAgEEAQIFAwUBAQAAAAABAgADEQQSITFBIlEFExRhcTKBkUJSobHwwSP/2gAMAwEAAhEDEQA/AMxxG4ow3wxnn/umHwwLZ79Nw7SIxJIBPcrPVaRbuFdb5UGyobMZMs+Y34u2k2q5tJ2pmIO/qJ5pZUOVb4agWoacRzTrzmXMCkFBisWDK6yyluFo+Gv2WctxlP8Ahp2XEPriet/THwfhLr+vARzXCEq4nkFUkM+dYcxFX4kZhA1riVK8oGcIUWzltp3diHWIkrR2dAEJHw+gQtFZrgnhzO1LcDKr4lb6beoxp01HMJc4bsZBgTymJ+SPkCCc5wOp6noFUXBxc1x16mlnlIkzzjcSQQOXJTdVd69q+O45VXxkw+54W2rbmi0+drWvpE5JcG7Hs4f3hYdt0RjIIwR0PMFba2GltMzJaS2Ry0k79oEfNK/ibhTXh11TB1Y8RoEgxgvj0gz0Eoej1Wz0N+05fRu5mdqXWEuqVZKOr0IOkGcA/MtBg9xMfJUigqXzd0TaoLKKNLKOpmFxtBV3AIC2CJ4DiGNvY5oW4vZSytVKiySV3ImTCKjdRRDbDGytsaeU6psEIqnE5iIKdMgpjQqwu1mhCVXwh2NPYhlavhLLi6AVN3XICUV7klL7d00ITdXMpa9666pKpKMqgQqmX03q5rkDrKIpleZIzVb4hgK4VWwqaBiPDkSMLq7C8vZnZpb62HRL6VCCttc2rchzA4H1BH+Vw29DhLn8GY7/AMT876H4PycMFKWuU7k7cDEQpKhzcppVolpgggjcFAVhlYRsyjp8SsKYUCpNK0ZSUy+23TO1qJQ10JlZ5C6i5fMU1i+mNm3GEFcXCupUyVTdWsJ79Mh7RmAObJTCnZgiUKWQjaFxhb3AiLuhzOtoQjLBsmP76/IYVIfKNY7w/KImJf8AN23v9G90vqLSi8dmFoQs3PUhc1Brk7U5JJxJyB9Q4+jWnmszwy+LrpjwWta9zWEEx5dcODZxuHH37In4t4kKVMM/M8a3dYGAJ5aoA+RSKyqilTZdEB5iGbENcS4bHeT12QqavRuI74EaZucT6D4odqgwJc+MiCyoNWJxghO6LWtOOcT2E+X7wstwC6b4LSZJczGrd3iHb6R7J9Qr6GtyM4HUtALvmdzCmWLtOMeYXuJPijgfh/vqbfISRUA/I7efQ5Wfa1fT9TalPI1NeId3acSF894lZGjUNM8sg7yDsU9pnycRHUA7cylrUPdMRdJU3IlUItWeIluKasoU0XUtl2hRWsTpl9q1FmovUKKtdbdl7mdUxdWqhLa1fKa17VK7ihHJZYEzXcXXdSUC5iZvooetTWlXAnYAWqtwRT2LjLclaziEC5lFKlzRLWoqnaQpOpQsM/vCV18wfSpNXXBcKFmUUXAkYXlKVxem8T7HeWyU1rZP7lLXDK9cARIiGLxba8OMHk4/YpHd2GA4bGfURuD0WvbRwl3E+HlzHOaYyJAIz3SLIKhuHUYW8p11Ma+lGFAJrUsDgzIOzuh79UurUtLiDy6fddDBupW0mqWzjzIlMOGlLgjLEolfcPqf0TQWzkXetbpa4c5kHkQk1GtCYXFTyU++r7pm0/pHvPn24MCuqE7IMUiE6YAV19viYWlrMybRBuFtzqMAN64zurqEtDqrt3c3bBoJ6/8AtsoXlbw6Za0ST5YEb/ie4g9MD1hUcQY11LQ78IMP3GtzRMAjpGVNcmx8nrr9o8qhVmX+KQahkS4EtBO+GCAT0b+KOus9EutGhzabZIbqe90cwPK1rZwcGe0qdStqcXO1F9QlognysxiByAb/AKlGi2C97RIpwAAY1AnMgdQAD6qsowuIqeTma/gTtAbIiNTD2PiN0sA5DygzstK+vGGgkksLQcbh0/QEdVnrCkDTOkGXjVknBLRoEDuBjsn7QTDt/wADm9oDS5vuCI6KPfgtkxteBxGlk7S0NmYJEdATIGexS/4xtNTG1Yy0hpP8p2+se6KoBoLgOwMjmDpb89h8kwqUhUpuYfzNIzyn+hhL1PscGCuTcpE+fMCsZSlXm3LcHBGD2IVlNsK0XxJqcCVG0lWMskwaQBJ2G6G4fesrNeRPlMCCi/NCjmd7kqNsivAC8145YVwcmlHEA5wYDXtEsr2AWgcUBcFcZROoxiGrZJbeWsLSPCAuqUoDuFjKDJmWNLKY2lqFXXpQUbYuQ0cNHWTC5lrrXCW3tOE+JSjiIXbRxOUt6ophRU1AoUoSMLq6vLs7PsdzcJa+4yh7u7QDq5JSAuLSQExHrLoQlvEbiQR9l2gJCruLYlMDJXBE3tXzM/UuntkgyOYPtKEqXIJkCZ3ym9a10mYnqOoSGtb1GuJDZb/KeX+XdZSsE9QRLVPuqjQWs7K+hawEDa37mDSADMGHz9I6hP7KoKjdoPTf2Wlwvcb+u+YuD3A2NynBozSYehPsSUIbfKaW7tVPw4yNj1HRZvsOFYeDz+IjY3MpZThdq3WkGBMCY+w9SVDO39/NRu3ilSe8xLfq4iGj7fVMX6jaNq9mZ0tZtbcehFbwfEBcPwQJP5qpcSTju6I6jslnGrqsGEaSIEGIgAnUXgjDvwxH8pTm3YAGuacN05P8bpE/IST8lmuP3EtcSImoDnP7tusN5RJEHr5gg0Dc3Uo2NgRJSqFhpuBlxcCyRsAYJ7zj2KKoMGonSNIgv8xALdgS4fmO/SYVFtR8uvVqeQ/ygTpbA1PBHOMR6nkpWDQIY52kOe1vONQEg/QAqiYss2vB6shpMwXwJzIBxJ/Kcx2MJ/SuJDYOctBO5IJbDgRgbZWc4Y1xIDgC4u1vG4lrngGBjUQ5vzbKdUXSXNJB0zpIAkamfhIHcOPyUS9Rkx5Y1t9gdjgEbhpMEg9c80yFTb1P1z/folVGpIlpMkDuADBBPXaCe6PYR9ZSFmV5njzE/GaEVC6MOg/Pn9kEGppxFrixwIy0yD1GP6n2Sc3LWkN/ETmG9hJ9FUotD05PYky+vZZ9jBviCs/wdDBLnnT0gcyTyClYgUqTWiOkjnG590tuLrU173SY2AH/AMsHr1V1C5c9glun+H0WlJZl9gYMYjFlczumNJ+EntmJtQCrKSYJxLXuSq7cZTOolV2utmcrEG1FSLFWw5RLVLvbmNLxFle1lV0qWlNTCEqHtC9V6YQ2EjEg4oC82RlV0cwfRBVymc7hN09xS8KDlbXVJWBKYnYXF5eXZ2bS5qoe2fJ3Xa+UHq0mUkAA0kEnE1VnkJtTtxCyVjxLMLTWV4CN1SRQRE7LiDiUcRtMbLLXI0lbevkLNcUsjMhYdMTdVpJxEN/bOe5j2af4XajpAAyCTy55XrC/NN4nBaciQZHPIwfVOLK2IyirvhTKrYcIPJzcEfMJU8jBEYeofqBl7XhwDhkHIK7VY8N8mHfpzCy1am+2qtbqcYEg7bnIgYOy2NlWD2NcNiP+Qsqo6PRi1pJP4g3+INadT2ODgIIA59R8kmv+NscYdBDBrA/iqOOlsjnA1e4RFnfOqte8gzTqOpkncFpxPXELOfE9m6pUbUphrYaG1G7eYEnUORBn6IdCf/Qq/jiMpYUG2G3fFTpbBG5J9SDJaeUNAAnqVneJXYdTaCJyZJPbvv69kvuqr2kB/l5gHmNpHsh6lzIgmROAqtVG3GJ57cwu1I8ukmXSHgSMGBjvH3TjhVVlSm+m+nqa2p5CCcuM46ydO/dIaDmxM5O0flIIgunfEp+yoBTogOAgQ6TIdIJEHkQ0QB1ctWjxO1maig8NOoOJ1E6Z3mPKH9QJg+onZObU4qNmHgtBkEgEZkHmCHxvyWasLuk3wiarAzchzmy0EEkH0IaPdPW8StIn9opZdqI8QAyNjv3ghR7Ub2P8R1XX3je1OnzCDIHPOnS0R7j7I6jEAAzsPf8A5+qS0uM22CaoMAGWhxAkbDEbgKF18R0n0ntpa5cIlw0kdxlKNW57E49irx5hl9xOgNTDUEgGQM7jbGJWQo1RJJMziNpHKTyVVChnYmdgOaJqvc5jqIYMkEwI/Ccy7bfCNXUE4HmI22NZzjqTpvpOqk6fKBho2BA3PzlWucqQ4ABoAEDYdeauaE3QgHMHjEvouRlGt1QDXQFQ+7gqpW0wwzHdWqISy5eqP2zc8gJJ6DqVQOINfOmXRvAK7YwA5MynE9ryrxVGASATtKDolznSfKwcuZ+fJTrETMR7n6lSLjkxleepbcv0Ey5rzGABin1g83nmeQwltW6VVy8oAvKJWTiMV05jHxFCo7CFa9efURd0OtWDB65VZCm4rgXRGR1Irit8N3Q+y8vZnZo9chCXBU2OMBCXteEkqktJRgVW9LXLR8F4xPNZYcMr1Zc2m4jrGEy4TwK4JbDS2euICofNrrXkiLtpXfoT6FbXIcFZWpByE4bwosHmeSjmtIMFBr1VdzFUMw2nejlhBRQhE02hWOYuNEIprxNG3cIDxPhVOsBq3EwRgiVk617WtHNY4ltPVkwCyTycd2yty5yX8Qtm1AWuAM4zzHQ9kiSVbkZE6MEczL/tlRmsGNL3vqY2IccH2AHyVVeoHQeex7jl7bJHx2t4VxDtQY0lhaDs2SWx1AJRd4/wwCxwexzQY6SJMH9CjtR03vMEE8ynj9h4tNukS5rj0HlIzBPeMLM1uGOadLm6T3PsfRbC1umuAg5KVfF9GadMxJDiJjZpEwY5T+qZ01rKwrM8GAGMRELNoOXN/v8ARGUrOlzqM+iTNwiqRMSBhPsp94aqxQeRHtK3txB/F6NH6puy7axocKTWt5AkBx7w1p+6QWtGoYIgjSXSDOGktznGfuhy9+xJKUerceTHn1wRMVDn8Cae44i1waOn36/or6N40N+3cdfRZ+0pCNb9vyj+I9f8v3RtrVcXeRjqjugS1lCgYEQLs7Fm5Jjuhd1Q5p8rBM+aZcAc6QN0xogxJBBM4OMHOQtLw2k1lNr3saHim3UcEg7xPaYVD6FuGitcVW0/EJc0OcG+X8sDfYBTlvQNyOvbnJlElK6CijlsZJ+3tM+KBmUXTpFML27sxTJoEV37NbT82e52AWef8KXNQh9WoWzmJJjsAEem5XPOR9j3/Enup8SfG+INot5F/Js7DqeyQ2d1VrEucWMYNzDjJ5NaBufsnVx8I04nxKk8z5c+4Vd3a6WBg2aIE+/3KeRvAgMmJK1zMtl0e0+qMsXQIBMb55+qCr0cphY0dlSNCBc+ZkNzGNEL1RiOt7bCjcUoUa+o5zGUeIrliBqNTG7wUC9DSUKpW0LjgjaVGdlZ/htQ7NWiwXswoYmKSEVwyyfWqNY1pIJE9gi28ArOIEbr6f8ACvAG0WARnmVlrweE5M1Y+xcmUUfh9gaBpGAPsvLYCiFxA+mb3k/6oz5ZZfDsCXmew5K+2+HqOvU4augOw+SY1q8YCtouEQd1JbUW957lUadVXqcqFrfKGrrHY2hWOqtmOa5WqYS+SYQe2JGnV1YBhdq1S0RukwFRjpHmBPLkmRrS0SjYatgymaeoHg8iH0KgeMjK45iHpVByU2VJMBP0fFHQbXGfvJt/w9WYsvEhVCErPhMHsQd3Rwq1LpcN6SPfW1RwZkvijgf7R5mODXRkEYceUOGx+Sxt0IMNMODR4jTOHAQT/wALe39yWZ6Gc/qp2FK3uKbqn7K01dRb5CAZgfxciD1RHuFQGRxOaZC5nzqnUwQDkeZvrzb8x9R3V9HizhhyZcWtqFM6X06lJ45OaWz06j2SF1oHTpI6+Z8Z5gSM9Uddtg5EM1Te0hxbw3TVB88iRyPLV6qizqDS4ExIEfLK4aBa4B4Ec4cDhWvFMuxLR6DHsUyOBiDwRO290WggEgbEbY3j3KLsafiEuOGN/EepOzB3P0ChTsqboAfkmCSMDlJM7f0TscLkinTDm027EgeY83GDufsgWOoGZ5QYNRouqOAAk7AbADYAdlsuA8AdSc2o+rkj8DNgCMlxO5jl3CEtPhurTdTfTIedQ1ZDQBzJLv0T34i4fdEeHTNOk186369dTJnytH4fWfZS7rt/AIA943SuDlh+Ir+JeM6nm0pFx0j985gJMxiiz+Y8zyCAqfDV9Xe172kaoBe9zZa3u0mcDlC1fwzwXwGta1xIE6nOyXuO7idwf0AWlqNEKbd8RWg7KQPyfMMaTZy/8QPhPD6VCm2nTbAaIk7k8yT1KvrHKuAEKsqN81i5cnmMKo6g9zTa4LKcUtCCea0VQODuyqqt1HIVHS6uyk5zkTNmmVup8/vKBacgorhxytZfUGaTIHzSQW1MGW/RfUab4oly4IxErNBYOV5jK12Vd1TwqaNcDmuXV5jGfRde6sjucr0lueok4jThLmbo67uHH8jvZAeP290p54lzT6C1hiabgtFpWmo0G9lgbTiZby9k+suPtOJUrV0WMSRHT8PsRepq6FISFqLEiFkOF3TXkLSsqgNQNFYanO6RdajZ2mMta8kh4ivKh9ekT+maZWtSzIOVOo/YKq2diSIKpuqr9Qa0b8z0UoKScT6LHvDP2lrXZ5rtSiCdRODsEB+yEPDtWrsUxbTJaZK4wC4IMywHci0aAAMyiaFs1wklLbJp5zI+yjW4gGv0A5K4a2Y4WcKE8Aw4GJAVdGr5iBup0wYBPNQr09JB6rIx1PDHUJ8XKIZbmoIEAoNr9O6NsqoBBOyLp9Q1Dbl6imqoWxMERVU4C1ziHwVxnCm0QdA0kkCWmM8j6rc3DaPhFw07fNY3ibHvYWgwdx3jkO6Z1T2fMALgg+0W0ap4GMe8xfxLw28a8ufTqV2nmADHeW5+iyFakS7Sab2u6EFbW74/VpHQ6q4OH5Xafs7PsUi4p8QVXCDpfPVztv8AKZ+6taU27QCB/qbupK5IOR9uYnvWEMH7ssLZkkE6th0xCUuBKIq3dSTpcW9gTCjTa87lp58gVSUbRzJ7ZdsAGW2Y5Oyn/C7Sk4jXUa0dXO29coC24ZUIENDvn/smdjbFshzQ3OfJJj/MTj2St7A9GOVae0jAQzccBoW1MHQxtZwG7Rj3I+ya2zaj6k6Ip6ZLjII3lo/qsvw3jDaDYAbP8TqgB+TQICss+NPqVm6q40kifOIA542UG6ixiT/kxlKW/qwv5Im1tYAgY7K8FCeCBzRHCrbxagYXQCD9FGWo2vtXszD7QpbPAlwIUDUGytu6QpvLJmPshdOUNqyjFW7EwuGGZCuyVS2mmltaOfhokjdBXNPSSCII3HRECuFDYOPebWwE7Yqv6IeCFnruxLZA+RWprUUpu6fJO6e0rwIwlpWZi3o185BHdXU70MdFQR35f7I9tYtO0hUXQZUnYHoqO/cfUOPtDfUqx5EOoX1F35m+4Vr2Uj/D9FguIUfDPb7KindHk4+6L9DkZVjGFCeGm7fwem84aB6I2z4GwflCQ/D/ABgCGudnutlZ3AcJGVP1Jur9OZyy+1fSTAqsUtseirpcde46NTvZG12hxyF42bBmMpcOuPUOYkzMzDMrFU9SvKr5ryNuX2je1ZCmBVpathuPkq7fDtVV3LE4Vxu6TKbWzy2G6X3Vq+4p+UDfEryDvPAzOZ7zLBVBr4JjBnsnLAHTpIMbrMcPvKranhuZMYKfMqwYIgHouaivBA+0yfUOJ6qCDg5QlWznzx5kT4kkw3HVMvDIaAIPVC3lJ0vtxBXVJpgfmVky0asFC3jA0h3IL1a4DwM45Qs7c8ic25xiEOhepZVFKjAklW8Pra/wiVkrxxPNwDLv2hwMb8gOpT3h9ozBJl/5ujW9AqafCCIIMk74kAdCELxK5FJpaN+cGCfdMJX8s5YSVbYLOFgvxzxWm9hp6GPEQNTQT65Xx+64dTc+CyJ5twt5WrNDH1HHzOlrQ7cdXQJ+Sxt0ckyPl/urOkezJJPMWdFUACKrzhbACRIySIJ26Qfugadm8fxI95K6HFVA7AdxYgZnuHWrtX43tPZxC1nBeD06jv3z6j5wQajo+cQs7ZUjM/qtbwuqQQdO+8kf1SGssfHpMNVz3Nrwz4T4bpH7kaxnLnEesEws18ScMZTIdTpsB/la0EEZG3omXC75zXZc0di9v9Uy4paCs2Qd9i0E/opJvfI3+P8AMKK1GcRZ8PcUFwImajR5mzEj+MdR16JnWvTSIc3DmnOVlqfBTTfqaKjngy2IpMB/me4zHbCIsg2r4moGo9jQahp/hlxIluc5ELlmmTPzE6jCW5G15yp8YONxU1N8rog9CBC0fDOL0XUiS6XfZfOrXhL6lRztDyycYT5nGre3b4bqT/EGzWsJJKJqaUYj5Yy3nE8vsTxPoPw7xMMLtU6XAZ7hC/EN6yo/UzGIM80JYXbdLXOgCJM4A7ZS3itc1n6LdzY5kZ+owlRba1XyGxtB/j95z5SC0v5lbTWdJa0kLjrCq78uU44TZV6bdLnNd7gpo0RvCTa/a2EAM01ky3C/h58aquHTgDkFbW+GBOoOg+gK1b3s1Bu5iVFlduU8tGpZslgIL5p9p8g478K3taqW06JLdtZgD1Ti+/6dVBQYykwF5iXuwNsmd19IdXEoujVlqsIxIVc9e3n8zDXOvIny+y/6TvgeJdkH+Ru3zJWi4V8DVqLSG3QeBsHsg+kg/otMLiUVbVEQ7bvS/ImGutHOZlKnD6zP/IyR1bkK2hwzxhDX6fqtkIKUcV+Hm1D4lJ76FUfmpmJ7Pbs4eoSj/CV3blPHtOjXMRg8H3ib/syr/wDs3/5P9VxMxSvRjxZ/9W/0Xln5Vf8AY039VqP7x/37TBW7GuqufpAbGCefojuD8QMEFsDUQ08nDslX/clrGmnUZA2k8kZR4gx7RloAMiEjbW5HqUyob0fiFV7Jzn+I0gHYhVcbaxrMuAI5oGrxoGoWDpv1Q95UD26CG+68lLggt/wnhevvGFhdkUg7fKOFV+uCcEYSqyreUMNOR1BRt7dUqDQ8yTseoCw6ZbAHJmjcmMw5zMSRhB1LIF2puOcKu/4xDBlukiQSUstviCnq81WmOo1LldF2MgTK6hR2Y4e7lKN4Q4NcIGJz2VlvQt7mgTSqtLowWkGCszw6/qNdocYLT5h31Y2WhSxXPt4mH1CuCon16pfsZTE8wvmvxVxJpJMR+qF+IuMVARpwOszy6LK8TvXPbGvsZO57Aqjl9SVLYAEnVafYDt5MCr8RzAcQOxx7KNdzJy8Fv8RkAmJjIS40xqgn9Qe0on4ha91FhgNpguDWjecSfaPqqQrUECCKsAciBXF/TmAD7rzLlh5JYdAGx1cj+q9Qrlu7QfVN/KGOItkiaK3qg8voEzt7kYhojuwFZejcj07BOLO9AgT7fqlLqoRGM3PCWOcQRpHZrWjb5L6HwjhLnU/M4k+pXzf4b4g2GxgiZnY9I57L6PwT4gBbtMe0qRWKxdi7qGs37Mr3M98R/D2klwyPdLOBMJJLWBpgMfAgOG4cTzI/RP8Aj/FX1NQbAgEz0HdLLR+hjXHYAdpJy5x7xPslbmX1LX14hqlbgtKuGVH1a1Wmz8LAD89sKzh9i9zteqIMAkZ+qG+DONUnXtR4gMfLW9wNj84n5p9f3LWPdGxM+6HqVNQG3uFDszFYRWBf+OHYjYLtvRa3YAegQFC9Djuj6b2gbqZa1hJ3HucZSBiEB/NRjXMKvVq54UqAAwFitgjBj4gyMCU2+HPf0GkLPG+d43hj8zh7c1qLp7fDMct/VZrhtofEdWIxsPVXd44x7ZhE5BJjC8r6QTKLZxMMt9ZPIrOcdrnYfNJal6+oG0/yhFRz2J015mu4Hel9OTyTnhVwSVnuEWxZRJOOaM+HruSR3Rq3wRBWJwZsab0Q0oCi9GUCrFTZk2wYlsLyv8MLyZ2GL7hPx0OFuOyLoWlwweWoWjpJVtG4hENvOyA9jz6urQaQjJzn8wB9nWOTUPuVV+xP/jd7lOG3Q6K0XDeix85x4jA+E6Vum/3FVrWr0zLKzwfU/qmx45c1G6H1A4d2iVzB5KYoNQ3dW5ZRmFr+EKD6Tn+YBWs/E/HUcfU49lV/hDB3+SbaGjkvajyXBc3gxo/CtN/UozF9GxLPNTJYerSQfonHw+4hz9RMugyTnB6lUNB6qdA6Tq37H+8LFjFwQZy34dWtZNa+DHnGbmWiY33SJ9u5zXEDVG8Z+gTipa+PTcGmIEEO98Eb+wWZtuIPoP8AKdpn/lD09ZC4XufN12mt8ylzSM8l6qXFukExMx35J/SvjVGotYcgGWN/RD/4mBMNAIJOGN5RsmA7e0Ye1WPUzdem5xJjJyYbH0A2Uf8AD3wHRAPM4HKSe2UzrcccRgGeRJ29AgDVe/BKZVmxzFGqWxupbSo02Y/G7rs35Dn80xtD1HLlhB0aQb3KKL4QbGJlrS6RETkRzb3DsaXHHqtbwWo7w5JOTAG/LJ7LF2NaFqLe4IptPb7qRq18RSypQY2tq0+ICd9MegMEfVLOL1jTo3NSYApu0ju/TTaf9R9kpvL8sqMeJidJ7gpn8ScPfWtWsa4NDnhzu4YCWt9zPyQUrCWIW6P/AJFXP6tsx/B+Iim5p6LfU+PsqBpAzzHNYvhHwxJl9Q+gW24Nw1lIagt/EGoJz2ZilXxzGlANLdQG6m3aEM5525K2kozDzGs5hVKoWtgGUO59XUCDA5jqi2skKVNkIQYDJmeIutatQPMmWncLS1LZpYNOw2SltITKPt68COSd0upQNtYdwNoJwRMpx+l5oCu+HeAz+9dsNu5TG+tgX6inrS3wm6RAjZO0qCSD0J6ywgDHmIfiK5DKekc0v+G3QFVx0lzz2XeDujC4LcnM1t9M2drUwmVFyQWVRObdyqaazMQuSH615VSuKhuie0T/2Q==', description: 'Complete housewarming ceremony with Vastu puja and traditional rituals for new home', noPartner: true },
  { id: 18, name: 'Satyanarayan Katha', category: 'pujari', price: 2800, duration: '3-4 hours', rating: 4.9, reviews: 521, image: 'https://wiralfeed.wordpress.com/wp-content/uploads/2015/10/satyanarayana_swamy_pooja.jpg', description: 'Sacred Satyanarayan katha with puja, prasad preparation, and complete puja samagri', popular: true, noPartner: true },
  { id: 19, name: 'Havan Ceremony', category: 'pujari', price: 4200, duration: '4-5 hours', rating: 4.8, reviews: 198, image: 'https://sanity-admin.rudraksha-ratna.com/static/images/blogs/havan%2Bkund.jpg', description: 'Traditional havan ceremony for peace, prosperity, and positive energy at your premises', noPartner: true },
  { id: 20, name: 'Lakshmi Puja', category: 'pujari', price: 2500, duration: '2-3 hours', rating: 4.9, reviews: 612, image: 'https://resources.ganeshaspeaks.com/wp-content/uploads/2024/06/Laxmi-Puja_1-2-1024x1024.webp', description: 'Auspicious Lakshmi puja for wealth and prosperity, ideal for Diwali and special occasions', popular: true, noPartner: true },
  { id: 21, name: 'Rudrabhishek Puja', category: 'pujari', price: 3200, duration: '3-4 hours', rating: 4.7, reviews: 156, image: 'https://temple.yatradham.org/public/Product/puja-rituals/puja-rituals_NhFBvsos_202508122106500.webp', description: 'Sacred Shiva puja with abhishek, mantra chanting, and complete Vedic rituals', noPartner: true },
  { id: 22, name: 'Vastu Shanti Puja', category: 'pujari', price: 3800, duration: '4-5 hours', rating: 4.8, reviews: 234, image: 'https://www.harivara.com/wp-content/uploads/2017/04/Vastu-Shanti-Puja-Harivara-Hindi.jpg', description: 'Comprehensive Vastu Shanti ceremony to remove doshas and bring harmony to your space', noPartner: true },
  
  // New Pujari Services (No partners yet)
  { id: 23, name: 'Vivah (Wedding Ceremony)', category: 'pujari', price: 5500, duration: '5-6 hours', rating: 0, reviews: 0, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop', description: 'Complete traditional Hindu wedding ceremony with all rituals, mantras, and pheras conducted by experienced pujari', noPartner: true },
  { id: 24, name: 'Ring Ceremony', category: 'pujari', price: 2500, duration: '1-2 hours', rating: 0, reviews: 0, image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&h=300&fit=crop', description: 'Sacred engagement ceremony with ring exchange rituals, mantras, and blessings from experienced pujari', noPartner: true },
  { id: 25, name: 'Ramayan Path', category: 'pujari', price: 3500, duration: '4-5 hours', rating: 0, reviews: 0, image: 'https://images.unsplash.com/photo-1609619385002-f40f5c30f8bc?w=400&h=300&fit=crop', description: 'Complete recitation of Ramayan with devotional bhajans and religious discourse for peace and prosperity', noPartner: true },
  { id: 26, name: 'Mahamrityunjay Jaap', category: 'pujari', price: 4000, duration: '3-4 hours', rating: 0, reviews: 0, image: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=400&h=300&fit=crop', description: 'Powerful Mahamrityunjay mantra jaap for health, longevity, and protection from negativity', noPartner: true },
  { id: 27, name: 'Gayatri Jaap', category: 'pujari', price: 2800, duration: '2-3 hours', rating: 0, reviews: 0, image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=300&fit=crop', description: 'Sacred Gayatri mantra chanting for wisdom, enlightenment, and spiritual growth', noPartner: true },
  { id: 28, name: 'Pitra Shanti Puja', category: 'pujari', price: 3200, duration: '2-3 hours', rating: 0, reviews: 0, image: 'https://images.unsplash.com/photo-1609619385002-f40f5c30f8bc?w=400&h=300&fit=crop', description: 'Ancestral peace ceremony to appease departed souls and seek their blessings for the family', noPartner: true },
  { id: 29, name: 'Nav Graha Shanti', category: 'pujari', price: 4500, duration: '4-5 hours', rating: 0, reviews: 0, image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop', description: 'Complete nine planets puja to balance planetary influences and remove negative effects from horoscope', noPartner: true },
  { id: 37, name: 'Bhoomi Poojan', category: 'pujari', price: 3500, duration: '2-3 hours', rating: 0, reviews: 0, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', description: 'Ground breaking ceremony before construction with Vastu rituals for successful project completion', noPartner: true },
  { id: 38, name: 'Vaahan Poojan', category: 'pujari', price: 1500, duration: '1 hour', rating: 0, reviews: 0, image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop', description: 'Vehicle blessing ceremony for new car, bike, or any vehicle for safe travels and protection', noPartner: true },
  { id: 39, name: 'Shraadh Karm', category: 'pujari', price: 3000, duration: '2-3 hours', rating: 0, reviews: 0, image: 'https://images.unsplash.com/photo-1609619385002-f40f5c30f8bc?w=400&h=300&fit=crop', description: 'Sacred ritual to honor and pay respects to departed ancestors during Pitru Paksha', noPartner: true },
  { id: 40, name: 'Janmadin Poojan', category: 'pujari', price: 2000, duration: '1-2 hours', rating: 0, reviews: 0, image: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=400&h=300&fit=crop', description: 'Birthday blessing ceremony with special puja, havan, and mantras for long life and prosperity', noPartner: true },
  { id: 41, name: 'Sundarkand Path', category: 'pujari', price: 2800, duration: '3-4 hours', rating: 0, reviews: 0, image: 'https://images.unsplash.com/photo-1609619385002-f40f5c30f8bc?w=400&h=300&fit=crop', description: 'Recitation of Sundarkand from Ramcharitmanas for removing obstacles and bringing success', noPartner: true },

  // Driver Services (shared with guests)
  { id: 30, name: 'Full-Day Personal Driver', category: 'driver', price: 1000, duration: '10 hours included', rating: 4.9, reviews: 512, image: 'https://img3.exportersindia.com/product_images/bc-full/2020/4/6825337/personal-driver-hire-services-1587207037-5379171.jpg', description: 'Experienced personal driver for city travel (10 hours included). Additional hours billed at double rate.', driverConfig: { baseHours: 10, hourlyRate: 100, overtimeMultiplier: 2 }, noPartner: true },
  { id: 31, name: 'Outstation Driving Service', category: 'driver', price: 1600, duration: '12 hours included', rating: 4.8, reviews: 341, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSU7Cv46ra4TewB-zaeZSKaOcOoDQ92Viqhw0eRUpNvttweH1eY24iDrRp03t9H0AhVFF8&usqp=CAU', description: 'Highway-ready driver for weekend getaways or business travel outside the city. Includes night-halt readiness.', driverConfig: { baseHours: 12, hourlyRate: 130, overtimeMultiplier: 1.75 }, noPartner: true },
];

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const normalizeServiceName = (name = '') => name.trim().toLowerCase();
const buildPricingMap = (rawPricing = {}) => Object.entries(rawPricing || {}).reduce((acc, [serviceName, info]) => {
  const key = normalizeServiceName(serviceName);
  if (!key) return acc;
  const numericPrice = Number(info?.price);
  if (!Number.isFinite(numericPrice)) return acc;
  acc[key] = {
    price: numericPrice,
    providerCount: Number(info?.providerCount) || 0
  };
  return acc;
}, {});

const BookingModal = ({ open, onClose, baseService, servicesList = [], onConfirm, customer }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [billingType, setBillingType] = useState(baseService?.category === 'pujari' ? 'cash' : 'one-time');
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [driverStartTime, setDriverStartTime] = useState('09:00');
  const [driverEndTime, setDriverEndTime] = useState('19:00');
  const [driverError, setDriverError] = useState('');
  const [providerOptions, setProviderOptions] = useState([]);
  const [providerStatus, setProviderStatus] = useState('idle');
  const [providerError, setProviderError] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const isDriverService = baseService?.category === 'driver';

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setCurrentStep(1);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedExtras([]);
      setBillingType(baseService?.category === 'pujari' ? 'cash' : (isDriverService ? 'hourly' : 'one-time'));
      setQuantity(1);
      setAddress('');
      setPhone('');
      setNotes('');
      setDriverStartTime('09:00');
      setDriverEndTime('19:00');
      setDriverError('');
      setProviderOptions([]);
      setProviderStatus('idle');
      setProviderError('');
      setSelectedProviderId(null);
      setStatus('idle');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, baseService, isDriverService]);

  // Generate next 30 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = generateDates();

  const timeSlots = [
    { time: '08:00 AM', value: '08:00', available: true },
    { time: '09:00 AM', value: '09:00', available: true },
    { time: '10:00 AM', value: '10:00', available: true },
    { time: '11:00 AM', value: '11:00', available: true },
    { time: '12:00 PM', value: '12:00', available: true },
    { time: '01:00 PM', value: '13:00', available: false },
    { time: '02:00 PM', value: '14:00', available: true },
    { time: '03:00 PM', value: '15:00', available: true },
    { time: '04:00 PM', value: '16:00', available: true },
    { time: '05:00 PM', value: '17:00', available: true },
    { time: '06:00 PM', value: '18:00', available: true },
  ];

  const timeToMinutes = (value) => {
    if (!value || typeof value !== 'string' || !value.includes(':')) return null;
    const [hours, minutes] = value.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const driverConfig = useMemo(() => {
    if (!isDriverService) return null;
    const baseHours = baseService?.driverConfig?.baseHours ?? 10;
    const hourlyRate = baseService?.driverConfig?.hourlyRate ?? (((baseService?.price || 0) / baseHours) || 0);
    const overtimeMultiplier = baseService?.driverConfig?.overtimeMultiplier ?? 2;
    return { baseHours, hourlyRate, overtimeMultiplier };
  }, [baseService, isDriverService]);

  const driverPricing = useMemo(() => {
    if (!isDriverService) return null;
    const startMinutes = timeToMinutes(driverStartTime);
    const endMinutes = timeToMinutes(driverEndTime);
    if (startMinutes === null || endMinutes === null) {
      return { error: 'Please select valid start and end times' };
    }
    if (endMinutes <= startMinutes) {
      return { error: 'End time must be later than start time' };
    }

    const totalMinutes = endMinutes - startMinutes;
    const totalHours = totalMinutes / 60;
    const baseHours = driverConfig?.baseHours ?? 10;
    const hourlyRate = driverConfig?.hourlyRate ?? (((baseService?.price || 0) / baseHours) || 0);
    const overtimeMultiplier = driverConfig?.overtimeMultiplier ?? 2;
    const overtimeHours = Math.max(0, totalHours - baseHours);
    const billableBaseHours = Math.min(totalHours, baseHours);
    const baseCost = billableBaseHours * hourlyRate;
    const overtimeRate = hourlyRate * overtimeMultiplier;
    const overtimeCost = overtimeHours * overtimeRate;

    return {
      totalPrice: baseCost + overtimeCost,
      totalHours: Number(totalHours.toFixed(2)),
      overtimeHours: Number(overtimeHours.toFixed(2)),
      baseHours,
      hourlyRate,
      overtimeMultiplier,
      overtimeRate,
      baseCost,
      overtimeCost
    };
  }, [baseService, driverConfig, driverEndTime, driverStartTime, isDriverService]);

  useEffect(() => {
    if (!isDriverService) return;
    setDriverError(driverPricing?.error || '');
  }, [driverPricing, isDriverService]);

  useEffect(() => {
    if (!open || !baseService?.name) return;
    let ignore = false;

    const fetchProviders = async () => {
      setProviderStatus('loading');
      setProviderError('');
      try {
        const response = await fetch(`/api/provider/by-service?service=${encodeURIComponent(baseService.name)}`);
        const data = await response.json();
        if (ignore) return;

        if (!response.ok || data.success === false) {
          throw new Error(data.message || 'Unable to load partners');
        }

        const providers = data.providers || [];
        setProviderOptions(providers);
        setSelectedProviderId(providers[0]?.id || null);
        setProviderStatus('loaded');

        if (!providers.length) {
          setProviderError('Currently no verified partners are available for this service.');
        }
      } catch (error) {
        if (ignore) return;
        setProviderOptions([]);
        setProviderStatus('error');
        setProviderError(error.message || 'Failed to load partners');
        setSelectedProviderId(null);
      }
    };

    fetchProviders();

    return () => {
      ignore = true;
    };
  }, [open, baseService?.name]);

  const toggleExtra = (id) => {
    setSelectedExtras(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectProvider = (id) => {
    setSelectedProviderId(id);
    setErrorMsg('');
  };

  const selectedExtrasDetails = useMemo(() => {
    if (!Array.isArray(selectedExtras) || !Array.isArray(servicesList)) return [];
    return selectedExtras
      .map(id => {
        const matched = servicesList.find(service => service.id === id);
        if (!matched) return null;
        return {
          serviceId: matched.id,
          serviceName: matched.name,
          price: matched.price,
          description: matched.description
        };
      })
      .filter(Boolean);
  }, [selectedExtras, servicesList]);

  const extrasTotal = selectedExtrasDetails.reduce((acc, extra) => acc + (extra.price || 0), 0);

  const selectedProvider = selectedProviderId ? providerOptions.find(p => p.id === selectedProviderId) : null;
  const providerPrice = selectedProvider?.price ?? baseService?.price ?? 0;

  const basePrice = providerPrice;
  const driverBaseAmount = isDriverService && driverPricing && !driverPricing.error ? driverPricing.totalPrice : 0;
  const driverBaseCost = isDriverService && driverPricing && !driverPricing.error ? driverPricing.baseCost : 0;
  const driverOvertimeCost = isDriverService && driverPricing && !driverPricing.error ? driverPricing.overtimeCost : 0;
  const driverSelectedHours = isDriverService && driverPricing && !driverPricing.error ? driverPricing.totalHours : 0;
  const driverOvertimeHours = isDriverService && driverPricing && !driverPricing.error ? driverPricing.overtimeHours : 0;
  const resolvedTimeLabel = !isDriverService ? timeSlots.find(t => t.value === selectedTime)?.time : null;
  const formattedSchedule = isDriverService ? `${driverStartTime} - ${driverEndTime}` : (resolvedTimeLabel || '--');
  const totalPrice = isDriverService
    ? driverBaseAmount + extrasTotal
    : (basePrice + extrasTotal) * (billingType === 'monthly' ? 4 : 1) * quantity;

  const canProceed = () => {
    if (currentStep === 1) {
      if (!selectedDate) return false;
      if (isDriverService) {
        return Boolean(driverPricing && !driverPricing.error);
      }
      return Boolean(selectedTime);
    }
    if (currentStep === 2) {
      if (!address.trim() || !phone.trim()) return false;
      if (providerStatus === 'loading') return false;
      if (providerStatus === 'error') return false;
      if (!providerOptions.length) return false;
      if (!selectedProviderId) return false;
      return true;
    }
    return false;
  };

  if (!open) return null;

  const handleConfirm = async () => {
    setStatus('submitting');
    setErrorMsg('');

    if (isDriverService && (!driverPricing || driverPricing.error)) {
      const message = driverPricing?.error || 'Please select valid start and end times';
      setDriverError(message);
      setErrorMsg(message);
      setStatus('idle');
      return;
    }

    if (providerStatus === 'loading') {
      const message = 'Please wait while we load verified partners.';
      setErrorMsg(message);
      setStatus('idle');
      return;
    }

    if (providerStatus === 'error') {
      setErrorMsg(providerError || 'Unable to load service partners right now.');
      setStatus('idle');
      return;
    }

    if (!providerOptions.length) {
      const message = providerError || 'Currently no verified partners are available for this service.';
      setErrorMsg(message);
      setStatus('idle');
      return;
    }

    if (!selectedProvider) {
      const message = 'Please choose a service partner to continue.';
      setErrorMsg(message);
      setStatus('idle');
      return;
    }

    const booking = {
      serviceId: baseService?.id || null,
      serviceName: baseService?.name || null,
      serviceCategory: baseService?.category || 'cleaning',
      customerPhone: phone.trim(),
      customerAddress: address.trim(),
      customerName: customer?.name || 'Guest',
      bookingDate: selectedDate?.toISOString(),
      bookingTime: isDriverService ? driverStartTime : selectedTime,
      basePrice: providerPrice,
      extras: selectedExtrasDetails,
      totalPrice: totalPrice,
      paymentMethod: isDriverService ? 'online' : billingType,
      billingType: isDriverService ? 'hourly' : billingType,
      quantity: isDriverService ? (driverSelectedHours || 1) : quantity,
      notes: notes.trim(),
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      priceBreakdown: {
        base: providerPrice,
        extras: extrasTotal,
        driverBaseAmount,
        driverOvertimeCost
      }
    };

    if (customer?.role === 'homeowner' && customer?.id) {
      booking.customerId = customer.id;
    }

    if (isDriverService && driverPricing && !driverPricing.error) {
      booking.driverDetails = {
        startTime: driverStartTime,
        endTime: driverEndTime,
        baseHours: driverPricing.baseHours,
        hourlyRate: driverPricing.hourlyRate,
        overtimeMultiplier: driverPricing.overtimeMultiplier,
        totalHours: driverPricing.totalHours,
        overtimeHours: driverPricing.overtimeHours,
        baseCost: driverPricing.baseCost,
        overtimeCost: driverPricing.overtimeCost
      };
    }

    try {
      // Save booking to database
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }

      // Call parent onConfirm if provided
      const result = onConfirm?.(booking);
      if (result && typeof result.then === 'function') {
        await result;
      }
      
      setStatus('success');
    } catch (err) {
      console.error('Booking failed:', err);
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-lg" />

        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col items-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 animate-bounce">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-bold mb-2">Booking Confirmed!</h3>
              <p className="text-green-100 text-center">We've received your booking request</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">Booking Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold text-gray-900">{baseService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Partner</span>
                  <span className="font-semibold text-gray-900">{selectedProvider?.name || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold text-gray-900">
                    {selectedDate?.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-semibold text-gray-900">{formattedSchedule}</span>
                </div>
                <div className="border-t-2 border-green-200 pt-3 mt-3 flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total Amount</span>
                  <span className="font-bold text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {currency.format(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">📱 Confirmation sent!</span><br />
                Our team will contact you shortly at <span className="font-medium">{phone}</span> to confirm the booking.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setStatus('idle'); onClose?.(); }} 
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5"
              >
                Done
              </button>
              <button 
                onClick={() => { setStatus('idle'); setCurrentStep(1); }} 
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-lg" onClick={() => { if (status === 'idle') onClose?.(); }} />

      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-48 translate-x-48" />
          
          <div className="relative flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-200" />
                <span className="text-blue-100 text-sm font-semibold">Premium Service Booking</span>
              </div>
              <h2 className="text-3xl font-bold">{baseService?.name}</h2>
            </div>
            <button 
              onClick={() => { if (status === 'idle') onClose?.(); }} 
              className="p-2 rounded-full hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="relative flex items-center justify-between mt-6">
            {[
              { num: 1, label: 'Date & Time' },
              { num: 2, label: 'Your Details' },
              { num: 3, label: 'Review' }
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all duration-300 ${
                    currentStep >= step.num 
                      ? 'bg-white text-blue-600 shadow-xl ring-4 ring-white/30' 
                      : 'bg-white/20 text-white/50 border-2 border-white/30'
                  }`}>
                    {currentStep > step.num ? '✓' : step.num}
                  </div>
                  <span className={`mt-2 text-sm font-semibold ${
                    currentStep >= step.num ? 'text-white drop-shadow-lg' : 'text-white/50'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                    currentStep > step.num ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Step 1: Date & Time */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Calendar */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  Select Date
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {availableDates.slice(0, 21).map((date, idx) => {
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const isToday = new Date().toDateString() === date.toDateString();
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`group relative p-3 rounded-xl border-2 transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                            : isToday
                            ? 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className={`text-xs font-semibold mb-1 ${
                          isSelected ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-lg font-bold ${
                          isSelected ? 'text-white' : 'text-gray-900'
                        }`}>
                          {date.getDate()}
                        </div>
                        {isToday && !isSelected && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedDate && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <p className="text-sm font-semibold text-blue-900">
                      📅 Selected: {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>

              {/* Time Slots */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-purple-600" />
                  {isDriverService ? 'Select Driver Schedule' : 'Select Time Slot'}
                </h3>
                {isDriverService ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={driverStartTime}
                          onChange={(e) => setDriverStartTime(e.target.value)}
                          className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base font-semibold bg-white hover:border-purple-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                        <input
                          type="time"
                          value={driverEndTime}
                          onChange={(e) => setDriverEndTime(e.target.value)}
                          className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base font-semibold bg-white hover:border-purple-300"
                        />
                      </div>
                    </div>
                    {driverError ? (
                      <p className="text-sm font-semibold text-red-600">{driverError}</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 text-sm font-semibold text-gray-800">
                        <div>
                          <p className="text-xs text-gray-500">Included Hours</p>
                          <p>{driverPricing?.baseHours ?? driverConfig?.baseHours ?? 0} hrs</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Selected Hours</p>
                          <p>{driverSelectedHours || 0} hrs</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Overtime</p>
                          <p>{driverOvertimeHours || 0} hrs</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base font-semibold bg-white hover:border-purple-300"
                  >
                    <option value="">Choose a time slot</option>
                    {timeSlots.map((slot) => (
                      <option 
                        key={slot.value} 
                        value={slot.value}
                        disabled={!slot.available}
                      >
                        {slot.time} {!slot.available ? '(Booked)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{baseService?.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{baseService?.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        {baseService?.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {baseService?.rating}
                      </span>
                      <span className="font-bold text-blue-600">{selectedProvider ? currency.format(providerPrice) : `from ${currency.format(baseService?.price || 0)}`}</span>
                    </div>
                    {selectedProvider && (
                      <p className="text-xs text-gray-500 mt-2">Selected partner: <span className="font-semibold text-gray-800">{selectedProvider.name}</span></p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h4 className="text-lg font-bold text-gray-900">Choose Your Service Partner</h4>
                </div>

                {providerStatus === 'loading' && (
                  <div className="space-y-3">
                    {[0,1,2].map(idx => (
                      <div key={idx} className="p-5 border-2 border-gray-200 rounded-2xl bg-white/70 animate-pulse">
                        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                )}

                {providerStatus === 'error' && (
                  <div className="p-4 border-2 border-red-200 rounded-2xl bg-red-50 text-sm font-semibold text-red-700">
                    {providerError || 'Failed to load partners. Please try again.'}
                  </div>
                )}

                {providerStatus === 'loaded' && providerOptions.length === 0 && (
                  <div className="p-4 border-2 border-amber-200 rounded-2xl bg-amber-50 text-sm font-semibold text-amber-900">
                    Currently no verified partners are available for this service. Please check back soon.
                  </div>
                )}

                {providerOptions.length > 0 && (
                  <div className="space-y-3">
                    {providerOptions.map((partner, index) => {
                      const isSelected = selectedProviderId === partner.id;
                      const isBestValue = index === 0;
                      const ratingDisplay = typeof partner.rating === 'number' ? partner.rating.toFixed(1) : partner.rating ?? '—';

                      return (
                        <button
                          type="button"
                          key={partner.id}
                          onClick={() => handleSelectProvider(partner.id)}
                          className={`w-full text-left p-5 border-2 rounded-2xl transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br ${
                              isSelected ? 'from-blue-600 to-indigo-600' : 'from-gray-600 to-gray-700'
                            }`}>
                              {partner.profileImage ? (
                                <img src={partner.profileImage} alt={partner.name} className="w-full h-full object-cover rounded-2xl" />
                              ) : (
                                <span>{partner.name?.[0] ?? 'P'}</span>
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-gray-900 text-lg">{partner.name}</p>
                                {isBestValue && (
                                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">Best price</span>
                                )}
                                {isSelected && (
                                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Selected
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1 text-gray-800">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-semibold">{ratingDisplay}</span>
                                  {partner.totalReviews ? (
                                    <span className="text-xs text-gray-500">({partner.totalReviews})</span>
                                  ) : null}
                                </span>
                                {partner.experience ? (
                                  <span>{partner.experience}+ yrs experience</span>
                                ) : (
                                  <span>Verified partner</span>
                                )}
                                {partner.workingHours && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {partner.workingHours?.startTime && partner.workingHours?.endTime
                                      ? `${partner.workingHours.startTime} - ${partner.workingHours.endTime}`
                                      : partner.workingHours}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Shield className="w-4 h-4 text-blue-500" />
                                Background checked & insured
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">{currency.format(partner.price)}</p>
                              <p className="text-xs text-gray-500">partner quote</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your 10-digit mobile number"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base font-medium"
                    maxLength="10"
                  />
                </div>

                {baseService?.category === 'pujari' ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBillingType('cash')}
                        className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                          billingType === 'cash'
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-600 text-white shadow-md'
                            : 'border-gray-300 hover:border-green-400 text-gray-700'
                        }`}
                      >
                        Cash After Pooja
                      </button>
                      <button
                        type="button"
                        disabled
                        className="p-4 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed relative"
                      >
                        <div className="flex flex-col items-center">
                          <span>UPI</span>
                          <span className="text-xs mt-1 bg-orange-500 text-white px-2 py-0.5 rounded-full">Coming Soon</span>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : isDriverService ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Driver Billing</label>
                    <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm text-gray-700 mb-2">Base coverage includes {driverConfig?.baseHours ?? 10} hours at ₹{driverConfig?.hourlyRate ?? 0}/hr. Additional hours auto-switch to {driverConfig?.overtimeMultiplier ?? 2}x.</p>
                      <div className="text-xs text-gray-500">Billing type locked to hourly for chauffeur bookings.</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Billing Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'one-time', label: 'One Time' },
                        { value: 'monthly', label: 'Monthly' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setBillingType(type.value)}
                          className={`p-3 rounded-xl border-2 font-semibold transition-all ${
                            billingType === type.value
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-md'
                              : 'border-gray-300 hover:border-blue-400 text-gray-700'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Service Address *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your complete address with landmark"
                  rows="3"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-base"
                />
              </div>

              {baseService?.category !== 'pujari' && servicesList.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Add-on Services (Optional)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {servicesList.slice(0, 4).map((service) => {
                      const isSelected = selectedExtras.includes(service.id);
                      return (
                        <button
                          key={service.id}
                          onClick={() => toggleExtra(service.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50'
                              : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                              isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                            }`}>
                              {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">{service.name}</p>
                              <p className="text-emerald-600 font-bold text-sm mt-1">{currency.format(service.price)}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {baseService?.category !== 'pujari' && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Special Instructions (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific requirements or instructions for the service provider..."
                    rows="3"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-base"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-4">Review Your Booking</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-100 mb-1">Service</p>
                    <p className="font-semibold">{baseService?.name}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 mb-1">Date & Time</p>
                    <p className="font-semibold">
                      {selectedDate?.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at {formattedSchedule}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-100 mb-1">Phone</p>
                    <p className="font-semibold">{phone}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 mb-1">Service Partner</p>
                    <p className="font-semibold">{selectedProvider?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 mb-1">{isDriverService ? 'Billing' : baseService?.category === 'pujari' ? 'Payment Method' : 'Billing'}</p>
                    <p className="font-semibold">
                      {isDriverService
                        ? 'Hourly (auto overtime)'
                        : baseService?.category === 'pujari'
                          ? (billingType === 'cash' ? 'Cash After Pooja' : 'UPI')
                          : billingType}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">Address</h4>
                <p className="text-gray-700">{address}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">{baseService?.category === 'pujari' ? 'Price Details' : 'Price Breakdown'}</h4>
                <div className="space-y-3">
                  {isDriverService ? (
                    <>
                      <div className="flex justify-between text-gray-700">
                        <span>Included Hours ({driverPricing?.baseHours ?? driverConfig?.baseHours ?? 10}h)</span>
                        <span className="font-semibold">{currency.format(driverBaseCost)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Selected Hours</span>
                        <span className="font-semibold">{driverSelectedHours || 0} hrs</span>
                      </div>
                      {driverOvertimeCost > 0 && (
                        <div className="flex justify-between text-gray-700">
                          <span>Overtime ({driverOvertimeHours || 0}h @ {driverPricing?.overtimeMultiplier ?? 2}x)</span>
                          <span className="font-semibold">{currency.format(driverOvertimeCost)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-gray-700">
                        <span>{baseService?.category === 'pujari' ? 'Pooja Service' : 'Partner Quote'}</span>
                        <span className="font-semibold">{currency.format(basePrice)}</span>
                      </div>
                      {baseService?.category !== 'pujari' && billingType === 'monthly' && (
                        <div className="flex justify-between text-gray-700">
                          <span>Monthly (x4)</span>
                          <span className="font-semibold">x4</span>
                        </div>
                      )}
                    </>
                  )}
                  {extrasTotal > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Add-ons ({selectedExtras.length})</span>
                      <span className="font-semibold">{currency.format(extrasTotal)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-emerald-300 pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {currency.format(totalPrice)}
                    </span>
                  </div>
                  {baseService?.category === 'pujari' && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-3 mt-2">
                      <p className="text-xs text-green-800">Payment will be collected after successful completion of the pooja</p>
                    </div>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6">
          <div className="flex items-center justify-between gap-4">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              >
                ← Back
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                className="ml-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center gap-2"
              >
                Continue
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={status === 'submitting'}
                className="ml-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
                      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm Booking
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceCard = ({ service, onBook, isFavorite, onToggleFavorite, startingPrice, providerCount }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [localQuote, setLocalQuote] = useState(null);
  const [localProviderCount, setLocalProviderCount] = useState(0);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const isActive = service.category === 'driver' || service.category === 'pujari';

  useEffect(() => {
    if (!isActive || fetchAttempted) return;

    let ignore = false;
    setFetchAttempted(true);

    const loadQuote = async () => {
      try {
        const response = await fetch(`/api/provider/by-service?service=${encodeURIComponent(service.name)}`);
        const data = await response.json();
        if (ignore) return;
        if (!response.ok || data.success === false) return;
        const cheapest = data.providers?.[0];
        const numericPrice = Number(cheapest?.price);
        if (!cheapest || !Number.isFinite(numericPrice)) return;
        setLocalQuote(numericPrice);
        setLocalProviderCount(data.providers?.length || 0);
      } catch (error) {
        console.error(`[MyServices] Failed to fetch pricing for ${service.name}`, error);
      }
    };

    loadQuote();

    return () => {
      ignore = true;
    };
  }, [fetchAttempted, isActive, service.name]);

  const sanitizedStartingPrice = Number.isFinite(Number(startingPrice)) ? Number(startingPrice) : null;
  const sanitizedProviderCount = Number.isFinite(Number(providerCount)) ? Number(providerCount) : 0;
  const effectiveQuote = sanitizedStartingPrice ?? localQuote;
  const effectiveProviderCount = sanitizedProviderCount || localProviderCount;
  const hasPartnerQuote = typeof effectiveQuote === 'number' && Number.isFinite(effectiveQuote) && effectiveQuote >= 0;
  const displayPrice = hasPartnerQuote ? effectiveQuote : service.price;
  const partnerCountLabel = hasPartnerQuote
    ? (effectiveProviderCount > 0 ? `${effectiveProviderCount} partner${effectiveProviderCount > 1 ? 's' : ''}` : 'Verified partner quote')
    : 'per session';
  const hasNoPartner = fetchAttempted ? effectiveProviderCount === 0 : service.noPartner === true;

  const handleBook = () => {
    if (!isActive || hasNoPartner) return;
    onBook?.(service);
  };

  return (
    <div 
      className={`group bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-500 ${isActive ? 'hover:shadow-2xl hover:-translate-y-2' : 'opacity-80'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={service.image} 
          alt={service.name} 
          className={`w-full h-56 object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'} ${isActive ? '' : 'filter grayscale'}`} 
          loading="lazy" 
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {service.popular && isActive && !hasNoPartner && (
          <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm bg-gradient-to-r from-orange-500 to-red-500 text-white">
            Popular
          </span>
        )}

        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="px-4 py-1.5 rounded-full bg-black/70 text-white text-xs font-semibold uppercase tracking-wider">Coming Soon</span>
          </div>
        )}
        
        <button 
          aria-label={`favorite ${service.name}`} 
          onClick={() => onToggleFavorite?.(service.id)}
          className={`absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2.5 transition-all duration-300 hover:scale-110 ${
            isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
        </button>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{service.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{service.description}</p>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-1">
            {hasNoPartner ? (
              <>
                <Star className="w-5 h-5 text-gray-300" />
                <span className="text-sm text-gray-400">No ratings yet</span>
              </>
            ) : (
              <>
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-900">{service.rating ?? '-'}</span>
                <span className="text-sm text-gray-500">({service.reviews ?? 0})</span>
              </>
            )}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-medium">{service.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {hasNoPartner ? (
              <>
                <div className="text-sm font-semibold text-orange-600">No Partner Available</div>
                <div className="text-lg font-medium text-gray-400">Price not available</div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-gray-600">{hasPartnerQuote ? 'Starting from' : 'Base price'}</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{currency.format(displayPrice)}</div>
                <p className="text-xs text-gray-500 mt-0.5">{partnerCountLabel}</p>
              </>
            )}
          </div>
          <button
            onClick={handleBook}
            disabled={!isActive || hasNoPartner}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
              hasNoPartner
                ? 'bg-orange-100 text-orange-600 cursor-not-allowed'
                : isActive 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5 shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                : 'bg-gray-200 text-gray-600 cursor-not-allowed'
            }`}
          >
            {hasNoPartner ? 'Coming Soon' : isActive ? 'Book Now' : 'Coming Soon'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MyServicesPage() {
  const { user, loading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState(null);
  const [servicePricing, setServicePricing] = useState({});

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !isLoggedIn) {
      router.push('/');
    }
  }, [loading, isLoggedIn, router]);

  useEffect(() => {
    let ignore = false;

    const fetchIndividualFallback = async (serviceNames) => {
      const results = {};
      for (const name of serviceNames) {
        try {
          const response = await fetch(`/api/provider/by-service?service=${encodeURIComponent(name)}`);
          const data = await response.json();
          if (!response.ok || data.success === false) continue;
          const cheapest = data.providers?.[0];
          const numericPrice = Number(cheapest?.price);
          if (!cheapest || !Number.isFinite(numericPrice)) continue;
          results[name] = {
            price: numericPrice,
            providerCount: data.providers?.length || 0
          };
        } catch (error) {
          console.warn('Fallback pricing fetch failed for', name, error);
        }
      }
      return results;
    };

    const fetchServicePricing = async () => {
      const uniqueServices = [...new Set(servicesData.map(service => service.name).filter(Boolean))];
      if (!uniqueServices.length) return;

      try {
        const response = await fetch('/api/provider/pricing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ services: uniqueServices })
        });

        const data = await response.json();
        if (ignore) return;

        if (!response.ok || data.success === false) {
          throw new Error(data.message || 'Unable to load service pricing');
        }

        if (data.pricing && Object.keys(data.pricing).length > 0) {
          setServicePricing(buildPricingMap(data.pricing));
          return;
        }

        const fallbackResults = await fetchIndividualFallback(uniqueServices);
        if (!ignore) {
          setServicePricing(buildPricingMap(fallbackResults));
        }
      } catch (error) {
        if (!ignore) {
          console.error('Failed to load provider pricing, using fallback', error);
          const fallbackResults = await fetchIndividualFallback(uniqueServices);
          if (!ignore) {
            setServicePricing(buildPricingMap(fallbackResults));
          }
        }
      }
    };

    fetchServicePricing();

    return () => {
      ignore = true;
    };
  }, []);

  const handleBook = (service) => {
    setBookingService(service);
    setBookingOpen(true);
  };

  const handleConfirmBooking = async (booking) => {
    console.log('Booking confirmed:', booking);
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredServices = useMemo(() => {
    let filtered = servicesData;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (priceRange !== 'all') {
      if (priceRange === '0-500') filtered = filtered.filter(s => s.price <= 500);
      else if (priceRange === '500-1000') filtered = filtered.filter(s => s.price > 500 && s.price <= 1000);
      else if (priceRange === '1000-1500') filtered = filtered.filter(s => s.price > 1000 && s.price <= 1500);
      else if (priceRange === '1500') filtered = filtered.filter(s => s.price > 1500);
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case 'popular': sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0)); break;
      case 'rating': sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'price-low': sorted.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'price-high': sorted.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      default: break;
    }

    const activeServices = [];
    const inactiveServices = [];
    sorted.forEach(service => {
      if (service.category === 'driver' || service.category === 'pujari') {
        activeServices.push(service);
      } else {
        inactiveServices.push(service);
      }
    });

    return [...activeServices, ...inactiveServices];
  }, [searchTerm, selectedCategory, sortBy, priceRange]);

  const categories = useMemo(() => ([
    { id: 'all', name: 'All Services', count: servicesData.length, icon: Sparkles },
    { id: 'cleaning', name: 'House Cleaning', count: servicesData.filter(s => s.category === 'cleaning').length, icon: Star },
    { id: 'deep-clean', name: 'Deep Cleaning', count: servicesData.filter(s => s.category === 'deep-clean').length, icon: Award },
    { id: 'bathroom', name: 'Bathroom Cleaning', count: servicesData.filter(s => s.category === 'bathroom').length, icon: Shield },
    { id: 'kitchen', name: 'Kitchen Cleaning', count: servicesData.filter(s => s.category === 'kitchen').length, icon: Zap },
    { id: 'laundry', name: 'Laundry Services', count: servicesData.filter(s => s.category === 'laundry').length, icon: Heart },
    { id: 'carpet', name: 'Carpet & Upholstery', count: servicesData.filter(s => s.category === 'carpet').length, icon: Star },
    { id: 'window', name: 'Window Cleaning', count: servicesData.filter(s => s.category === 'window').length, icon: Sparkles },
    { id: 'move', name: 'Move In/Out', count: servicesData.filter(s => s.category === 'move').length, icon: Award },
    { id: 'pujari', name: 'Pujari Services', count: servicesData.filter(s => s.category === 'pujari').length, icon: Sparkles },
    { id: 'driver', name: 'Driver Services', count: servicesData.filter(s => s.category === 'driver').length, icon: Car },
    { id: 'specialty', name: 'Specialty Services', count: servicesData.filter(s => s.category === 'specialty').length, icon: Zap },
  ]), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 pt-16">
        <div className="text-center">
          <div className="inline-block relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 text-lg mt-6 font-medium">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 pt-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl translate-y-48 -translate-x-48" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6" />
                <span className="text-blue-200 font-semibold">Welcome, {user?.name || 'User'}</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">Browse All Services</h1>
              <p className="text-xl text-blue-100 mb-6 leading-relaxed">Discover and book from our wide range of professional services tailored for you</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>100% Verified Professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>Top Rated Services</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>Same Day Booking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-80 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-xl mb-5 flex items-center gap-2 text-gray-900">
                <Filter className="w-5 h-5 text-blue-600" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button 
                      key={cat.id} 
                      onClick={() => setSelectedCategory(cat.id)} 
                      className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${
                        selectedCategory === cat.id 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span>{cat.name}</span>
                        </div>
                        <span className={`text-sm px-2.5 py-1 rounded-full ${
                          selectedCategory === cat.id 
                            ? 'bg-white/20' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {cat.count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-xl mb-5 text-gray-900">Price Range</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Prices' },
                  { value: '0-500', label: '₹0 - ₹500' },
                  { value: '500-1000', label: '₹500 - ₹1,000' },
                  { value: '1000-1500', label: '₹1,000 - ₹1,500' },
                  { value: '1500', label: '₹1,500+' }
                ].map(price => (
                  <button 
                    key={price.value} 
                    onClick={() => setPriceRange(price.value)} 
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      priceRange === price.value 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {price.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Why Choose Us?</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Verified Professionals</p>
                    <p className="text-gray-600">Background checked staff</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Quality Guaranteed</p>
                    <p className="text-gray-600">100% satisfaction promise</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Quick Service</p>
                    <p className="text-gray-600">Same day availability</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Search and Sort Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    placeholder="Search for services..." 
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400 font-medium"
                  />
                </div>

                <div className="relative">
                  <select 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value)} 
                    className="appearance-none bg-white border-2 border-gray-300 rounded-xl px-5 py-3.5 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400 font-medium min-w-[200px]"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  {filteredServices.length} Services Available
                </h2>
                <p className="text-gray-600 mt-1">Find the perfect service for your needs</p>
              </div>
            </div>

            {/* Services Grid */}
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map(s => (
                  <ServiceCard 
                    key={s.id} 
                    service={s} 
                    onBook={handleBook}
                    isFavorite={favorites.includes(s.id)}
                    onToggleFavorite={toggleFavorite}
                    startingPrice={servicePricing[normalizeServiceName(s.name)]?.price}
                    providerCount={servicePricing[normalizeServiceName(s.name)]?.providerCount || 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                <div className="text-gray-400 mb-4">
                  <Search className="w-20 h-20 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No services found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setPriceRange('all'); }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/30"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        baseService={bookingService}
        servicesList={servicesData}
        onConfirm={handleConfirmBooking}
        customer={user}
      />
    </div>
  );
}
