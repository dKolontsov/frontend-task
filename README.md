# React + TypeScript + Vite

## Тестовое задание: Three.js + React

### Установка и запуск проекта

```sh
npm install
npm run dev
```

## Задачи

### **1. Реализация виджета для отображения иерархии объектов `THREE.Object3D`**

#### **Место в коде**

Файл `App.tsx`

#### **Требования к реализации**

- Виджет должен отображать иерархию объектов, содержащихся в `viewer.model`.
- При клике на объект в виджете соответстующая мешка или группа должна выделиться в сцене.
- Детали реализации виджета и визуализации хайлайта остаются на усмотрение кандидата.

### **2. Визуализация значений свойств объектов**

- Каждому объекту в `THREE.Object3D` добавлено поле `userData`, содержащее значение свойства:
  ```js
  userData: {
    propertyValue: {
      statusCode: number, // Число в диапазоне от 1 до 4
      statusText: string // Описание статуса установки
    }
  }
  ```
- Возможные значения `propertyValue.statusCode`:
  - `1` - Not Started
  - `2` - In Progress
  - `3` - Partially Installed
  - `4` - Installed
- Значение этого свойства должно визуализироваться в центре объекта.
- Тип визуализации выбирается кандидатом (например, текстовые метки, 3D-объекты, SVG плашки и т.д.)
- Важно чтобы текст метки был читаемым
- В `README.md` необходимо описать, почему выбран именно этот способ рендера.

### **3. Оптимизация отображения меток (опционально)**

При большом количестве объектов текстовые метки могут перекрываться. Возможные решения:

- **Группировка** — если метки перекрываются, можно отображать пузырь с количеством скрытых меток.
- **Скрытие перекрывающихся элементов** — исключение части меток, которые перекрывают другие.
- Реализация одного из этих методов (или альтернативного) на усмотрение кандидата.

## **Общие рекомендации**

- Приветствуется создание новых классов, сервисов для разделения ответсвенности, а также дополнение класса `Viewer` если это необходимо
- Приветствуется использование RXJS, пример реализации в компоненте `Loading`
- Расположение новых созданных файлов на усмотрение кандидата

## **Ожидаемые результаты**

- Реализованный интерактивный виджет с корректным отображением иерархии объектов.
- Отображение значений `userData.propertyValue` в центре каждого объекта.
- Опциональная реализация системы управления перекрывающимися метками.

## **Формат сдачи**

- Исходный код с коммитами.
- Файл `README.md` с описанием выбранного подхода к рендеру меток.
