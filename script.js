const number1 = document.getElementById("number1");
const number2 = document.getElementById("number2");
const result = document.getElementById("result");
const addBtn = document.getElementById("addBtn");
const subBtn = document.getElementById("subBtn");

function getNumbers() {
  const a = Number(number1.value);
  const b = Number(number2.value);

  if (number1.value === "" || number2.value === "") {
    result.textContent = "Kết quả: hãy nhập đủ 2 số";
    return null;
  }

  return { a, b };
}

addBtn.addEventListener("click", () => {
  const values = getNumbers();
  if (!values) return;

  result.textContent = `Kết quả: ${values.a + values.b}`;
});

subBtn.addEventListener("click", () => {
  const values = getNumbers();
  if (!values) return;

  result.textContent = `Kết quả: ${values.a - values.b}`;
});
