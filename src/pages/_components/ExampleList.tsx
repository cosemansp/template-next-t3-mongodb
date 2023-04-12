import { api } from "@/utils/api";

const ExampleList = () => {
  const { data, isLoading } = api.example.getById.useQuery({
    id: "507f1f77bcf86cd799439011",
  });

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
