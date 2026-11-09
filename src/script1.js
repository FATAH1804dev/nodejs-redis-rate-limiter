import http from "k6/http";
import { sleep } from "k6";
import { Counter } from "k6/metrics";

// Setiap VU memakai token berbeda agar penghitung rate limit tiap pengguna terpisah.
const tokens = [
  "0c0c2f55-0518-4df7-8f23-a1439ee4b8fe",
  "7d56858d-070d-4d97-95b5-4959c01d0fdf",
  "8ca59425-e20f-48a8-a15a-db2c059e13f0",
  "26231eba-40ab-418c-a10d-364538a9ece5",
  "4460d361-108d-4767-8654-b488f1e8926b",
  "1fa628f2-7604-4df2-a014-fe99ecc21c25",
  "07ff28cf-fca1-4480-ac07-c5d1579a1a1a",
  "57d019ff-2684-4656-900f-2269282797a1",
  "ca2175bc-517a-4774-bcbc-cfb82b161f87",
  "8324d6d6-ec62-404b-bf35-6f5a20be9237",
  "4bcd8471-9beb-458f-a003-c51fa32cbcca",
  "2ee1c99e-749a-4f56-b0c7-4b127cba754a",
  "325687e0-1a52-42c4-b6ad-2ccb9cff14fe",
  "3d76d338-788f-426a-a119-e7d6831492ad",
  "4641cd3a-3e67-4144-a512-da14d39f3b70",
  "d35b303b-2242-4471-abcf-2824d60d9f51",
  "1afd1ee4-94d8-47b8-b5f2-4f481afcab19",
  "53604d2e-b481-4310-8ab1-046ec95a38d4",
  "8de2a826-e9a6-4374-9d5c-c4facef42c71",
  "f8826c24-5390-40da-8e7c-e823dfa055c4",
  "2efe2502-e43c-4c3c-99da-a4ab7da6bd36",
  "0bd93ebe-08de-4899-9407-cbdb7aa75d2d",
  "235e563c-a58b-439c-a80f-436ce97ce0c6",
  "6d18663c-bac0-4934-88e5-d0d0d771bc10",
  "bdab9b0c-6187-4b88-a87d-4125fb62236c",
  "faeda044-ff1e-4f91-9458-496dfe3ec404",
  "26ee8df9-6b0a-440e-992e-9164ef2d11ad",
  "a802a746-83a1-4aa6-9b5f-26f21d58bf89",
  "696b8728-b5fb-4220-8bd4-7d9b21fa19e5",
  "8a55dbd6-affe-4617-8da2-03a42845cc91",
  "7653d190-e483-402a-9146-2646d3f7a85b",
  "091d9b8b-5048-44b2-96f7-e748df1aa777",
  "72a6763e-21f6-48d0-88ab-fc839fe77dc0",
  "9ddc13e0-49a6-4f83-ac2e-4344d25c8432",
  "3ecb5686-2e0c-41f6-80ec-ee5f210c9118",
  "f6ac8de7-b06b-4813-8ed8-afefa78d237b",
  "a0f898fc-b823-4b8a-acd5-97e9310a2a85",
  "1c749185-9cf0-4863-9e2c-cd4804fa41a4",
  "4a4abe54-c668-44c9-8955-93b5020bb770",
  "76736ef1-f9da-481d-9209-bad9cde27004",
  "6b43f88c-f98a-4de7-9214-273ac06573d2",
  "bc0e4b28-2ec7-47d6-939e-512552c3afa1",
  "37d52895-9cc2-45d5-a431-78aaa5b5879d",
  "0d2ea362-b72f-4bea-b783-46efc242d888",
  "38de9ec1-018f-4c16-b155-ac07f439fcd1",
  "33618081-5b4e-432d-aff2-64f14f3eef26",
  "a7320d6d-476b-4543-ae9d-261f766a1aba",
  "c3bf5d43-ee11-4102-aa1a-dffabdaad5cf",
  "927a2bc4-f572-4932-bf7a-1d421b118522",
  "900d321f-243e-478f-ae84-5c6adffbd93a",
  "1cbe2388-9ccf-4309-9cae-e58a7a683514",
  "8e5c5bba-ec6a-4e08-9339-328797958c39",
  "100a1c7f-7369-44ba-9b04-01c93b8e9f18",
  "e2825f15-c581-472e-bcec-7debd1e86c8c",
  "0dc862fe-e9d8-461c-bbb3-b4c5f692b083",
  "0a4534ad-10ff-44df-97a0-242207288db7",
  "8c4d4620-6185-47ce-aae7-de0d4e5f50c1",
  "13e6316d-0841-46c8-9eb2-4aaf8bcb1887",
  "4ed55100-4cf2-40a1-8e23-35434bb71eb1",
  "d889eee7-c907-44db-95a9-bf5b20f7a74f",
  "6df2c23a-cef4-4dde-b7c9-2e88ef315218",
  "18f0216b-c337-4dbc-bc1b-a6d9724e48ca",
  "ad617aaa-70c8-419a-b317-872d3f512be1",
  "e64f35d6-d879-4a47-9e96-f5693b25708f",
  "7a9b98f4-0abe-446e-bac2-9bf5eaa5adab",
  "7282fbf2-44d6-42fe-bfba-bce81423bde1",
  "09f71743-5583-460f-b0d8-09d41250e5b9",
  "bdbc80de-8ce1-4319-a6ff-63c898cd2f82",
  "61a6d5e2-b9de-4403-8f23-2a51a7a76e71",
  "718edb44-d576-4822-802a-ccaa7bbb1f33",
  "e57bbbe0-a533-439f-ac3d-17a56e94512c",
  "53de09af-622e-45eb-9d19-00e9f1750743",
  "ab2d7482-f446-495d-b02a-9390e23dd39c",
  "cb06022b-afb9-4a9f-95e1-521fbe9aa978",
  "b444d317-b059-4091-bea1-22b4d30a1750",
  "ec68595f-3584-4bf7-a0e6-ad5806381146",
  "9cb38ad7-524e-40e3-9e89-6ac3978670d7",
  "a7521725-2041-4866-a9bc-74e4377ca148",
  "955dd3c4-f26a-4780-bb4e-f1fd2277bcb7",
  "350e8a76-160d-49a6-92d0-696e89815fed",
  "24baf846-d656-485c-b675-ccbaff058650",
  "e457066e-52b0-48d0-8c4b-31e6a3e46031",
  "49e59b16-edf1-4622-9eb8-52febc4d8f10",
  "35fed94b-b23c-45f9-9cc3-2cdc794bd761",
  "728851e2-1126-4f78-a3f4-a1f654452e11",
  "e7cfdd47-e4a4-4d7d-9502-3750ee3722d0",
  "c43d187d-b840-423d-bb37-dcb0aa579738",
  "a28f02b0-b683-4af8-b536-6df05715d750",
  "c1aae20e-e229-44cd-bf03-865d80a5c378",
  "af3578ce-8341-4d5e-8af5-aa7f00a84a14",
  "02d73ef2-737c-46bb-8085-2dc7af68c98f",
  "c8e43dce-6ca2-4a6e-8857-82b618a9f40e",
  "e4e30059-7c29-44d0-a2eb-266d97022cbc",
  "9c97baa7-bbd8-49f8-9692-2c66dbc441d7",
  "52770534-d7ee-4ce1-8948-fa506e929233",
  "d03e7126-0b79-46d7-a25d-d4a527439f60",
  "f87edf56-3303-494b-89d3-1920e545095c",
  "bfc122e9-d669-4240-8d2d-0c91af6dea2c",
  "ff24e3e4-1c83-4768-9132-bfdaf6ec2e02",
  "1a386030-ccd6-4cab-9b1b-6c1b401924d7"
];

if (tokens.length !== 100 || new Set(tokens).size !== 100) {
  throw new Error("The test requires exactly 100 unique tokens.");
}

// Metrik khusus untuk menghitung respons selain sukses dan respons HTTP 429.
const nonSuccessfulRequests = new Counter("non_successful_requests");
const rateLimitedRequests = new Counter("rate_limited_requests");

// Jalankan 100 VU selama 60 detik; tes gagal jika ada request gagal atau terkena rate limit.
export const options = {
  vus: 100,
  duration: "60s",
  thresholds: {
    http_req_failed: ["rate==0"],
    non_successful_requests: ["count==0"],
    rate_limited_requests: ["count==0"],
  },
};

export default function () {
  // Nomor VU dimulai dari 1, sehingga indeks array token dikurangi 1.
  const token = tokens[__VU - 1];
  if (!token) {
    throw new Error(`No unique token assigned to VU ${__VU}.`);
  }

  // API mengidentifikasi pengguna dari token di header Authorization.
  const headers = {
    Accept: "application/json",
    Authorization: token,
  };
  const url = "http://localhost:3000/api/users/current";
  // Kirim dua request bersamaan: keduanya seharusnya masih dalam batas 2 request/detik.
  const responses = http.batch([
    ["GET", url, null, { headers: headers }],
    ["GET", url, null, { headers: headers }],
  ]);

  // Catat respons tak sukses dan 429 secara terpisah untuk threshold di atas.
  for (const response of responses) {
    if (response.status !== 200) {
      nonSuccessfulRequests.add(1);
    }
    if (response.status === 429) {
      rateLimitedRequests.add(1);
    }
  }

  // Jeda sebelum VU mengirim pasangan request berikutnya.
  sleep(1);
}
