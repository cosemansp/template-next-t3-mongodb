import { api } from "@/utils/api";

const ExampleList = () => {
  const { data, isLoading } = api.example.getById.useQuery({ id: "1" });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <p>id: {data?.id}</p>
      <p>name: {data?.name}</p>
    </div>
  );
};

export default ExampleList;
