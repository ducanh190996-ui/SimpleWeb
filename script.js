const number1 = document.getElementById("number1");
const number2 = document.getElementById("number2");
const result = document.getElementById("result");

const addBtn = document.getElementById("addBtn");
const subBtn = document.getElementById("subBtn");
const mulBtn = document.getElementById("mulBtn");
const divBtn = document.getElementById("divBtn");

function getNumbers() {
  if (number1.value === "" || number2.value === "") {
    result.textContent = "Kết quả: hãy nhập đủ 2 số";
    return null;
  }

  return {
    a: Number(number1.value),
    b: Number(number2.value)
  };
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

mulBtn.addEventListener("click", () => {
  const values = getNumbers();
  if (!values) return;

  result.textContent = `Kết quả: ${values.a * values.b}`;
});

divBtn.addEventListener("click", () => {
  const values = getNumbers();
  if (!values) return;

  if (values.b === 0) {
    result.textContent = "Kết quả: không thể chia cho 0";
    return;
  }

  result.textContent = `Kết quả: ${values.a / values.b}`;
});
